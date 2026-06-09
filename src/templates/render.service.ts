import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Handlebars from 'handlebars';
import { marked } from 'marked';

interface ReportData {
  sections?: { id: string; title: string; content: any }[];
  variables?: Record<string, any>;
}

function tiptapToText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  if (!node.content || !Array.isArray(node.content)) return '';
  return node.content.map((child: any) => {
    const text = tiptapToText(child);
    if (child.type === 'paragraph') return text + '\n\n';
    if (child.type === 'heading') return '#'.repeat(child.attrs?.level || 1) + ' ' + text + '\n\n';
    if (child.type === 'bulletList') return text;
    if (child.type === 'orderedList') return text;
    if (child.type === 'listItem') return '- ' + text + '\n';
    if (child.type === 'codeBlock') return '```\n' + text + '\n```\n\n';
    if (child.type === 'blockquote') return '> ' + text + '\n\n';
    return text;
  }).join('');
}

@Injectable()
export class RenderService {
  constructor(private prisma: PrismaService) {
    this.registerHelpers();
  }

  private registerHelpers() {
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('neq', (a, b) => a !== b);
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('gte', (a, b) => a >= b);
    Handlebars.registerHelper('lt', (a, b) => a < b);
    Handlebars.registerHelper('lte', (a, b) => a <= b);
    Handlebars.registerHelper('and', (a, b) => a && b);
    Handlebars.registerHelper('or', (a, b) => a || b);
    Handlebars.registerHelper('uppercase', (s) => typeof s === 'string' ? s.toUpperCase() : s);
    Handlebars.registerHelper('lowercase', (s) => typeof s === 'string' ? s.toLowerCase() : s);
    Handlebars.registerHelper('formatDate', (d, format) => {
      if (!d) return '';
      const date = new Date(d);
      if (format === 'short') return date.toLocaleDateString('fr-FR');
      if (format === 'long') return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    });
    Handlebars.registerHelper('markdown', (text) => {
      if (!text) return '';
      return new Handlebars.SafeString(marked.parse(text, { async: false }) as string);
    });
    Handlebars.registerHelper('severityColor', (severity) => {
      const colors: Record<string, string> = {
        CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#2563eb', INFO: '#6b7280',
      };
      return colors[severity] || '#6b7280';
    });
  }

  async renderProject(projectId: string): Promise<{ html: string; css: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        template: true,
        reports: true,
        findings: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            component: { select: { id: true, name: true } },
          },
          orderBy: [
            { severity: 'asc' },
            { title: 'asc' },
          ],
        },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        scopes: {
          include: {
            components: true,
          },
        },
        attackChains: {
          include: {
            findings: {
              include: {
                finding: {
                  select: { id: true, title: true, severity: true, slug: true, status: true },
                },
              },
              orderBy: { order: 'asc' as const },
            },
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Projet introuvable');
    if (!project.template) throw new NotFoundException('Aucun template assigné à ce projet');

    const firstReport = (project as any).reports?.[0];
    const reportData = (firstReport?.content || {}) as ReportData;
    const sections = reportData.sections || [];
    const customVars = reportData.variables || {};

    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
    const sortedFindings = [...project.findings].sort(
      (a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5),
    );

    const fieldToHtml = (value: any): string => {
      if (!value) return '';
      let text: string;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (parsed && parsed.type === 'doc') {
            text = tiptapToText(parsed);
          } else {
            text = value;
          }
        } catch {
          text = value;
        }
      } else {
        text = tiptapToText(value);
      }
      return marked.parse(text, { async: false }) as string;
    };

    const findingsData = sortedFindings.map((f) => ({
      ...f,
      severity_lower: f.severity.toLowerCase(),
      cvss_score: f.cvssScore != null ? f.cvssScore.toFixed(1) : '—',
      cvss_vector: f.cvssVector || '',
      description_html: fieldToHtml(f.description),
      proof_html: fieldToHtml(f.proof),
      impact_html: fieldToHtml(f.impact),
      remediation_html: fieldToHtml(f.remediation),
      author_name: f.author ? `${f.author.firstName} ${f.author.lastName}` : '',
      component_name: f.component?.name || '',
    }));

    const sectionsData = sections.map((s) => {
      const text = typeof s.content === 'string' ? s.content : tiptapToText(s.content);
      return {
        ...s,
        content_html: text ? marked.parse(text, { async: false }) : '',
      };
    });

    const auditTypeLabels: Record<string, string> = {
      APP_PENTEST: "Test d'intrusion applicatif",
      EXTERNAL_PENTEST: "Test d'intrusion externe",
      INTERNAL_PENTEST: "Test d'intrusion interne",
      CODE_AUDIT: 'Audit de code',
      ARCHITECTURE_AUDIT: "Audit d'architecture",
      CONFIG_AUDIT: 'Audit de configuration',
      CLOUD_CONFIG_AUDIT: 'Audit de configuration Cloud',
    };

    const templateVars: Record<string, any> = {
      // Projet
      project_name: project.name,
      client_company: project.clientCompany,
      client_need: project.clientNeed,
      project_context: project.context,
      start_date: new Date(project.startDate).toLocaleDateString('fr-FR'),
      end_date: new Date(project.endDate).toLocaleDateString('fr-FR'),
      audit_type: auditTypeLabels[project.auditType] || project.auditType,
      project_status: project.status,

      // Membres
      members: project.members.map((m) => ({
        name: `${m.user.firstName} ${m.user.lastName}`,
        email: m.user.email,
        role: m.role,
      })),
      pentesters: project.members
        .filter((m) => m.role === 'PENTESTER' || m.role === 'MANAGER')
        .map((m) => ({ name: `${m.user.firstName} ${m.user.lastName}`, email: m.user.email, role: m.role })),

      // Périmètres
      scopes: project.scopes.map((s) => ({
        name: s.name,
        description: s.description,
        status: s.status,
        components: s.components.map((c) => ({ name: c.name, type: c.type, status: c.status })),
      })),

      // Findings
      findings: findingsData,
      findings_total: findingsData.length,
      findings_critical: findingsData.filter((f) => f.severity === 'CRITICAL').length,
      findings_high: findingsData.filter((f) => f.severity === 'HIGH').length,
      findings_medium: findingsData.filter((f) => f.severity === 'MEDIUM').length,
      findings_low: findingsData.filter((f) => f.severity === 'LOW').length,
      findings_info: findingsData.filter((f) => f.severity === 'INFO').length,

      // Chaînes d'attaque
      attack_chains: (project as any).attackChains.map((chain: any) => ({
        name: chain.name,
        description: chain.description || '',
        description_html: chain.description
          ? marked.parse(chain.description, { async: false })
          : '',
        findings: chain.findings.map((cf: any) => ({
          order: cf.order + 1,
          title: cf.finding.title,
          severity: cf.finding.severity,
          severity_lower: cf.finding.severity.toLowerCase(),
          slug: cf.finding.slug || '',
          status: cf.finding.status,
        })),
      })),
      attack_chains_total: (project as any).attackChains.length,

      // Sections
      sections: sectionsData,

      // Variables custom de l'utilisateur
      ...customVars,
    };

    const compiledTemplate = Handlebars.compile(project.template.htmlContent);
    const html = compiledTemplate(templateVars);

    return { html, css: project.template.cssContent || '' };
  }

  async previewTemplate(templateId: string): Promise<{ html: string; css: string }> {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template introuvable');

    const previewData = (template.previewData as Record<string, any>) || {};

    const defaultPreview: Record<string, any> = {
      project_name: 'Projet de démonstration',
      client_company: 'Acme Corp',
      client_need: 'Audit de sécurité web',
      project_context: 'Application de gestion interne',
      start_date: '01/01/2026',
      end_date: '31/01/2026',
      audit_type: 'Web',
      project_status: 'IN_PROGRESS',
      members: [
        { name: 'Alice Martin', email: 'alice@example.com', role: 'MANAGER' },
        { name: 'Bob Dupont', email: 'bob@example.com', role: 'PENTESTER' },
      ],
      pentesters: [
        { name: 'Alice Martin', email: 'alice@example.com', role: 'MANAGER' },
        { name: 'Bob Dupont', email: 'bob@example.com', role: 'PENTESTER' },
      ],
      scopes: [
        { name: 'Application Web', description: 'Frontend React + API', status: 'COMPLETED', components: [] },
      ],
      findings: [
        {
          slug: 'ACME-001', title: 'Injection SQL', severity: 'CRITICAL', severity_lower: 'critical',
          cvss_score: '9.8', cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', status: 'CONFIRMED',
          description_html: '<p>Une injection SQL a été identifiée sur le paramètre <code>id</code>.</p>',
          proof_html: '<pre><code>GET /api/users?id=1 OR 1=1--</code></pre>',
          impact_html: '<p>Accès complet à la base de données.</p>',
          remediation_html: '<p>Utiliser des requêtes préparées.</p>',
          references: 'OWASP Top 10 - A03:2021',
        },
        {
          slug: 'ACME-002', title: 'XSS Réfléchi', severity: 'HIGH', severity_lower: 'high',
          cvss_score: '6.1', cvss_vector: '', status: 'CONFIRMED',
          description_html: '<p>Un XSS réfléchi a été détecté.</p>',
          proof_html: '', impact_html: '<p>Vol de session utilisateur.</p>',
          remediation_html: '<p>Encoder les sorties HTML.</p>', references: '',
        },
        {
          slug: 'ACME-003', title: 'En-têtes de sécurité manquants', severity: 'LOW', severity_lower: 'low',
          cvss_score: '3.1', cvss_vector: '', status: 'DRAFT',
          description_html: '<p>Plusieurs en-têtes HTTP de sécurité sont absents.</p>',
          proof_html: '', impact_html: '', remediation_html: '<p>Ajouter les en-têtes CSP, HSTS, X-Frame-Options.</p>',
          references: '',
        },
      ],
      findings_total: 3, findings_critical: 1, findings_high: 1, findings_medium: 0, findings_low: 1, findings_info: 0,
      attack_chains: [
        {
          name: 'Compromission complète via injection',
          description: 'Exploitation de l\'injection SQL pour extraire les credentials, puis XSS pour voler la session admin.',
          description_html: '<p>Exploitation de l\'injection SQL pour extraire les credentials, puis XSS pour voler la session admin.</p>',
          findings: [
            { order: 1, title: 'Injection SQL', severity: 'CRITICAL', severity_lower: 'critical', slug: 'ACME-001', status: 'CONFIRMED' },
            { order: 2, title: 'XSS Réfléchi', severity: 'HIGH', severity_lower: 'high', slug: 'ACME-002', status: 'CONFIRMED' },
          ],
        },
      ],
      attack_chains_total: 1,
      sections: [
        { title: 'Synthèse', content_html: '<p>Ce rapport présente les résultats du test d\'intrusion réalisé sur l\'application web d\'Acme Corp.</p>' },
        { title: 'Méthodologie', content_html: '<p>L\'audit a suivi la méthodologie OWASP Testing Guide v4.</p>' },
      ],
      ...previewData,
    };

    const compiledTemplate = Handlebars.compile(template.htmlContent);
    const html = compiledTemplate(defaultPreview);

    return { html, css: template.cssContent || '' };
  }
}
