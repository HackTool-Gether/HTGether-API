import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { streamCompletion } from './ai-providers';

const SYSTEM_PROMPTS: Record<string, string> = {
  reformulate: `Tu es un assistant expert en test d'intrusion et rédaction de rapports de pentest.
Tu aides les pentesters à rédiger des findings professionnels, clairs et exploitables.

Quand on te donne du contenu brut :
- Reformule en texte technique, structuré et factuel
- Utilise des titres, listes, blocs de code si pertinent
- Préserve les évidences techniques (URLs, headers, payloads, codes d'erreur)
- Si des captures d'écran sont présentes et utiles (Burp Suite, terminal, etc.), conserve-les et décris ce qu'elles montrent
- Si une image n'apporte pas de valeur technique, retire-la
- Extrais les données techniques visibles dans les images (URLs, erreurs, tokens, versions)

Tu écris toujours en français. Retourne uniquement le contenu reformulé, sans commentaire ni explication.`,

  generate: `Tu es un assistant expert en test d'intrusion et rédaction de rapports de pentest.
Tu aides les pentesters à rédiger du contenu de rapport de pentest.

À partir des indications données, génère du contenu professionnel pour un rapport de pentest.
Structure le contenu avec des titres, listes et blocs de code si nécessaire.
Sois précis, technique et factuel.

Tu écris toujours en français. Retourne uniquement le contenu généré.`,

  complete: `Tu es un assistant expert en test d'intrusion et rédaction de rapports de pentest.
Tu aides les pentesters en complétant le texte en cours de rédaction.

Continue le texte de manière naturelle et cohérente, en gardant le même style et niveau technique.
Ne répète pas ce qui est déjà écrit.

Tu écris toujours en français. Retourne uniquement la suite du texte.`,
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private settingsService: SettingsService,
    private kbService: KnowledgeBaseService,
  ) {}

  async *generate(userId: string, content: string, images: string[], projectId: string | undefined, action: string) {
    const aiConfig = await this.settingsService.get<any>('ai');
    if (!aiConfig?.enabled) {
      throw new BadRequestException('Le module IA est désactivé');
    }
    if (!aiConfig.provider || !aiConfig.apiKey || !aiConfig.model) {
      throw new BadRequestException('La configuration IA est incomplète');
    }

    const kbContext = await this.kbService.getContext(userId, projectId);

    let systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.reformulate;
    if (kbContext) {
      systemPrompt += `\n\nContexte disponible de la base de connaissances :\n${kbContext}`;
    }

    const messageParts: any[] = [];
    if (content) {
      messageParts.push({ type: 'text', text: content });
    }
    for (const img of images) {
      messageParts.push({ type: 'image_url', image_url: { url: img } });
    }

    const messages = [
      { role: 'user' as const, content: messageParts.length === 1 && messageParts[0].type === 'text' ? messageParts[0].text : messageParts },
    ];

    this.logger.log(`AI generate: provider=${aiConfig.provider} model=${aiConfig.model} action=${action} project=${projectId || 'none'}`);

    yield* streamCompletion(aiConfig.provider, aiConfig.apiKey, aiConfig.model, systemPrompt, messages);
  }
}
