import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SettingsKey = 'company' | 'ai' | 'smtp' | 'onboarding';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get<T = any>(key: SettingsKey): Promise<T | null> {
    const setting = await this.prisma.platformSettings.findUnique({
      where: { key },
    });
    return setting ? (setting.value as T) : null;
  }

  async set(key: SettingsKey, value: any) {
    return this.prisma.platformSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getAll() {
    const settings = await this.prisma.platformSettings.findMany();
    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async isOnboardingComplete(): Promise<boolean> {
    const onboarding = await this.get<{ completed: boolean }>('onboarding');
    return onboarding?.completed === true;
  }
}
