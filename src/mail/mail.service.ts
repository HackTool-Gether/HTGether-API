import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';

interface SmtpConfig {
  enabled: boolean;
  provider?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  secure?: boolean;
  apiKey?: string;
  domain?: string;
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private settingsService: SettingsService) {}

  private async getTransporter(): Promise<nodemailer.Transporter | null> {
    const config = await this.settingsService.get<SmtpConfig>('smtp');
    if (!config || !config.enabled) return null;

    if (config.provider === 'mailgun' && config.apiKey && config.domain) {
      return nodemailer.createTransport({
        host: 'smtp.mailgun.org',
        port: 587,
        auth: {
          user: `postmaster@${config.domain}`,
          pass: config.apiKey,
        },
      });
    }

    if (config.host) {
      return nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: config.secure ?? false,
        auth: config.user
          ? { user: config.user, pass: config.password }
          : undefined,
      });
    }

    return null;
  }

  private async getFrom(): Promise<string> {
    const config = await this.settingsService.get<SmtpConfig>('smtp');
    const name = config?.fromName || 'HTGether';
    const email = config?.fromEmail || 'noreply@htgether.local';
    return `"${name}" <${email}>`;
  }

  async send(options: SendMailOptions): Promise<boolean> {
    const transporter = await this.getTransporter();
    if (!transporter) {
      this.logger.warn('Email non envoyé : SMTP non configuré');
      return false;
    }

    try {
      await transporter.sendMail({
        from: await this.getFrom(),
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email envoyé à ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur envoi email à ${options.to}`, error);
      return false;
    }
  }

  async sendInvitation(
    to: string,
    inviterName: string,
    projectName: string,
    role: string,
  ): Promise<boolean> {
    const roleLabel = { MANAGER: 'Manager', PENTESTER: 'Pentester', CLIENT: 'Client' }[role] || role;
    return this.send({
      to,
      subject: `Invitation au projet "${projectName}" — HTGether`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Nouvelle invitation</h2>
          <p><strong>${inviterName}</strong> vous a invité à rejoindre le projet <strong>${projectName}</strong> en tant que <strong>${roleLabel}</strong>.</p>
          <p>Connectez-vous à HTGether pour accepter ou refuser cette invitation.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="color: #888; font-size: 12px;">HTGether — Plateforme collaborative de pentest</p>
        </div>
      `,
    });
  }

  async sendFindingCreated(
    to: string,
    projectName: string,
    findingTitle: string,
    severity: string,
    creatorName: string,
  ): Promise<boolean> {
    const severityColors: Record<string, string> = {
      CRITICAL: '#dc2626',
      HIGH: '#ea580c',
      MEDIUM: '#d97706',
      LOW: '#2563eb',
      INFO: '#6b7280',
    };
    const color = severityColors[severity] || '#6b7280';
    return this.send({
      to,
      subject: `Nouveau finding ${severity} sur "${projectName}" — HTGether`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Nouveau finding</h2>
          <p><strong>${creatorName}</strong> a créé un finding sur le projet <strong>${projectName}</strong> :</p>
          <div style="padding: 12px 16px; border-left: 4px solid ${color}; background: #f9fafb; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold;">${findingTitle}</p>
            <p style="margin: 4px 0 0; color: ${color}; font-weight: bold;">${severity}</p>
          </div>
          <p>Connectez-vous à HTGether pour consulter les détails.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="color: #888; font-size: 12px;">HTGether — Plateforme collaborative de pentest</p>
        </div>
      `,
    });
  }

  async sendTaskAssigned(
    to: string,
    projectName: string,
    taskTitle: string,
    assignerName: string,
  ): Promise<boolean> {
    return this.send({
      to,
      subject: `Tâche assignée sur "${projectName}" — HTGether`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Tâche assignée</h2>
          <p><strong>${assignerName}</strong> vous a assigné une tâche sur le projet <strong>${projectName}</strong> :</p>
          <div style="padding: 12px 16px; border-left: 4px solid #2563eb; background: #f9fafb; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold;">${taskTitle}</p>
          </div>
          <p>Connectez-vous à HTGether pour consulter les détails.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="color: #888; font-size: 12px;">HTGether — Plateforme collaborative de pentest</p>
        </div>
      `,
    });
  }

  async sendMemberAdded(
    to: string,
    projectName: string,
    role: string,
  ): Promise<boolean> {
    const roleLabel = { MANAGER: 'Manager', PENTESTER: 'Pentester', CLIENT: 'Client' }[role] || role;
    return this.send({
      to,
      subject: `Ajout au projet "${projectName}" — HTGether`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Bienvenue dans le projet</h2>
          <p>Vous avez été ajouté au projet <strong>${projectName}</strong> en tant que <strong>${roleLabel}</strong>.</p>
          <p>Connectez-vous à HTGether pour accéder au projet.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="color: #888; font-size: 12px;">HTGether — Plateforme collaborative de pentest</p>
        </div>
      `,
    });
  }
}
