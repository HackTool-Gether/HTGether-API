type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

type Message = { role: 'user' | 'assistant' | 'system'; content: string | ContentPart[] };

interface ProviderConfig {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openai: {},
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: { 'HTTP-Referer': 'https://htgether.local', 'X-Title': 'HTGether' },
  },
  mistral: { baseURL: 'https://api.mistral.ai/v1' },
  gemini: { baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
};

export async function* streamCompletion(
  provider: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Message[],
): AsyncGenerator<string> {
  if (provider === 'anthropic') {
    yield* streamAnthropic(apiKey, model, systemPrompt, messages);
    return;
  }

  const config = PROVIDER_CONFIGS[provider] || {};
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({
    apiKey,
    ...(config.baseURL && { baseURL: config.baseURL }),
    ...(config.defaultHeaders && { defaultHeaders: config.defaultHeaders }),
  });

  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [{ role: 'system', content: systemPrompt }, ...messages] as any,
    max_tokens: 4096,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) yield delta;
  }
}

async function* streamAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: Message[],
): AsyncGenerator<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey });

  const anthropicMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      if (typeof m.content === 'string') {
        return { role: m.role as 'user' | 'assistant', content: m.content };
      }
      const blocks = (m.content as ContentPart[]).map((part) => {
        if (part.type === 'text') return { type: 'text' as const, text: part.text };
        const url = part.image_url.url;
        const match = url.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          return {
            type: 'image' as const,
            source: { type: 'base64' as const, media_type: match[1] as any, data: match[2] },
          };
        }
        return { type: 'text' as const, text: `[Image: ${url}]` };
      });
      return { role: m.role as 'user' | 'assistant', content: blocks };
    });

  const stream = client.messages.stream({
    model,
    system: systemPrompt,
    messages: anthropicMessages as any,
    max_tokens: 4096,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && (event.delta as any).type === 'text_delta') {
      yield (event.delta as any).text;
    }
  }
}
