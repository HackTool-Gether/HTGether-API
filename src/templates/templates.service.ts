import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TEMPLATE_LIBRARY } from './library/template-library';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.reportTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { projects: true, assets: true } },
      },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id },
      include: {
        assets: true,
        _count: { select: { projects: true } },
      },
    });
    if (!template) throw new NotFoundException('Template introuvable');
    return template;
  }

  async create(dto: CreateTemplateDto) {
    return this.prisma.reportTemplate.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        htmlContent: dto.htmlContent || DEFAULT_HTML,
        cssContent: dto.cssContent || DEFAULT_CSS,
        variables: (dto.variables as any) || [],
        isDefault: dto.isDefault || false,
      },
      include: {
        _count: { select: { projects: true, assets: true } },
      },
    });
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.htmlContent !== undefined) data.htmlContent = dto.htmlContent;
    if (dto.cssContent !== undefined) data.cssContent = dto.cssContent;
    if (dto.variables !== undefined) data.variables = dto.variables;
    if (dto.previewData !== undefined) data.previewData = dto.previewData;
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;

    if (dto.isDefault) {
      await this.prisma.reportTemplate.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.reportTemplate.update({
      where: { id },
      data,
      include: {
        assets: true,
        _count: { select: { projects: true } },
      },
    });
  }

  async duplicate(id: string) {
    const original = await this.findOne(id);
    return this.prisma.reportTemplate.create({
      data: {
        name: `${original.name} (copie)`,
        description: original.description,
        htmlContent: original.htmlContent,
        cssContent: original.cssContent,
        variables: original.variables as any,
        previewData: original.previewData as any,
        isDefault: false,
      },
      include: {
        _count: { select: { projects: true, assets: true } },
      },
    });
  }

  async remove(id: string) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });
    if (!template) throw new NotFoundException('Template introuvable');
    if (template._count.projects > 0) {
      throw new ConflictException(
        'Ce template est utilisé par des projets et ne peut pas être supprimé',
      );
    }
    await this.prisma.reportTemplate.delete({ where: { id } });
    return { message: 'Template supprimé' };
  }

  async getAssets(templateId: string) {
    await this.findOne(templateId);
    return this.prisma.templateAsset.findMany({
      where: { templateId },
    });
  }

  async addAsset(templateId: string, fileName: string, filePath: string, type: string) {
    await this.findOne(templateId);
    return this.prisma.templateAsset.create({
      data: { templateId, fileName, filePath, type },
    });
  }

  async removeAsset(assetId: string) {
    const asset = await this.prisma.templateAsset.findUnique({
      where: { id: assetId },
    });
    if (!asset) throw new NotFoundException('Asset introuvable');
    await this.prisma.templateAsset.delete({ where: { id: assetId } });
    return { message: 'Asset supprimé' };
  }

  getLibrary() {
    return TEMPLATE_LIBRARY.map(({ slug, name, description, category }) => ({
      slug,
      name,
      description,
      category,
    }));
  }

  async importFromLibrary(slug: string) {
    const entry = TEMPLATE_LIBRARY.find((t) => t.slug === slug);
    if (!entry) {
      throw new NotFoundException(
        `Template "${slug}" introuvable dans la bibliothèque`,
      );
    }

    return this.prisma.reportTemplate.create({
      data: {
        name: entry.name,
        description: entry.description,
        htmlContent: entry.htmlContent,
        cssContent: entry.cssContent,
        variables: entry.variables as any,
        isDefault: false,
      },
      include: {
        _count: { select: { projects: true, assets: true } },
      },
    });
  }
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <!-- Page de couverture -->
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Rapport de test d'intrusion</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
    </div>
  </div>

  <!-- Sommaire -->
  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthèse</li>
    <li>Périmètre</li>
    <li>Méthodologie</li>
    <li>Résultats</li>
    <li>Vulnérabilités</li>
    <li>Recommandations</li>
    <li>Conclusion</li>
  </ol>

  <!-- Sections du rapport -->
  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <!-- Tableau récapitulatif -->
  <div class="page-break"></div>
  <h2>Vulnérabilités</h2>
  <table class="findings-table">
    <thead>
      <tr>
        <th>Ref</th>
        <th>Titre</th>
        <th>Sévérité</th>
        <th>CVSS</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      {{#each findings}}
      <tr>
        <td class="mono">{{ this.slug }}</td>
        <td>{{ this.title }}</td>
        <td><span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span></td>
        <td class="mono">{{ this.cvss_score }}</td>
        <td>{{ this.status }}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <!-- Détail des findings -->
  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>

    {{#if this.cvss_vector}}
    <p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>
    {{/if}}

    {{#if this.description_html}}
    <h4>Description</h4>
    <div>{{{ this.description_html }}}</div>
    {{/if}}

    {{#if this.proof_html}}
    <h4>Preuve</h4>
    <div>{{{ this.proof_html }}}</div>
    {{/if}}

    {{#if this.impact_html}}
    <h4>Impact</h4>
    <div>{{{ this.impact_html }}}</div>
    {{/if}}

    {{#if this.remediation_html}}
    <h4>Remédiation</h4>
    <div>{{{ this.remediation_html }}}</div>
    {{/if}}

    {{#if this.references}}
    <h4>Références</h4>
    <p>{{ this.references }}</p>
    {{/if}}
  </div>
  {{/each}}

  <!-- Statistiques -->
  <div class="page-break"></div>
  <h2>Statistiques</h2>
  <div class="stats-grid">
    <div class="stat"><span class="stat-value">{{ findings_total }}</span><span class="stat-label">Total</span></div>
    <div class="stat stat-critical"><span class="stat-value">{{ findings_critical }}</span><span class="stat-label">Critiques</span></div>
    <div class="stat stat-high"><span class="stat-value">{{ findings_high }}</span><span class="stat-label">Hautes</span></div>
    <div class="stat stat-medium"><span class="stat-value">{{ findings_medium }}</span><span class="stat-label">Moyennes</span></div>
    <div class="stat stat-low"><span class="stat-value">{{ findings_low }}</span><span class="stat-label">Basses</span></div>
    <div class="stat stat-info"><span class="stat-value">{{ findings_info }}</span><span class="stat-label">Info</span></div>
  </div>
</body>
</html>`;

const DEFAULT_CSS = `@page {
  size: A4 portrait;
  margin: 25mm 20mm 25mm 20mm;

  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-size: 9pt;
    color: #888;
    font-family: 'Inter', sans-serif;
  }
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 10.5pt;
  line-height: 1.6;
  color: #1a1a2e;
}

h1 { font-size: 28pt; font-weight: 700; margin-bottom: 8pt; }
h2 { font-size: 18pt; font-weight: 600; margin-bottom: 12pt; color: #1a1a2e; border-bottom: 2px solid #5e6ad2; padding-bottom: 6pt; }
h3 { font-size: 14pt; font-weight: 600; margin-bottom: 8pt; }
h4 { font-size: 11pt; font-weight: 600; margin: 12pt 0 6pt; color: #444; }
p { margin-bottom: 8pt; }

.page-break { break-before: always; }

/* Couverture */
.cover-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80vh;
}
.cover-page h1 { font-size: 36pt; color: #5e6ad2; }
.cover-page .subtitle { font-size: 16pt; color: #666; margin-bottom: 40pt; }
.cover-meta p { font-size: 11pt; margin-bottom: 4pt; }

/* Sommaire */
.toc { padding-left: 20pt; }
.toc li { margin-bottom: 6pt; font-size: 12pt; }

/* Tables */
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 12pt 0; }
th { background: #f0f0f5; text-align: left; padding: 8pt 10pt; font-weight: 600; border-bottom: 2px solid #ddd; }
td { padding: 6pt 10pt; border-bottom: 1px solid #eee; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 9pt; }

/* Sévérité */
.severity {
  display: inline-block;
  padding: 2pt 8pt;
  border-radius: 4pt;
  font-size: 8.5pt;
  font-weight: 600;
  text-transform: uppercase;
}
.severity-critical { background: #dc2626; color: white; }
.severity-high { background: #ea580c; color: white; }
.severity-medium { background: #d97706; color: white; }
.severity-low { background: #2563eb; color: white; }
.severity-info { background: #6b7280; color: white; }

/* Findings */
.finding { margin-bottom: 20pt; }
.finding-header { display: flex; align-items: center; gap: 10pt; margin-bottom: 6pt; }
.finding-slug { color: #888; font-size: 10pt; }
.cvss { color: #666; font-size: 9.5pt; margin-bottom: 10pt; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12pt;
  margin-top: 16pt;
}
.stat {
  text-align: center;
  padding: 16pt 12pt;
  border-radius: 8pt;
  background: #f8f8fc;
  border: 1px solid #e8e8f0;
}
.stat-value { display: block; font-size: 28pt; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 9pt; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-critical .stat-value { color: #dc2626; }
.stat-high .stat-value { color: #ea580c; }
.stat-medium .stat-value { color: #d97706; }
.stat-low .stat-value { color: #2563eb; }
.stat-info .stat-value { color: #6b7280; }

/* Markdown content */
.section-content ul, .section-content ol { padding-left: 18pt; margin-bottom: 8pt; }
.section-content li { margin-bottom: 3pt; }
.section-content code {
  background: #f4f4f8;
  padding: 1pt 4pt;
  border-radius: 3pt;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9pt;
}
.section-content pre {
  background: #1a1a2e;
  color: #e0e0e0;
  padding: 12pt;
  border-radius: 6pt;
  overflow-x: auto;
  margin: 10pt 0;
  font-size: 8.5pt;
  line-height: 1.5;
}
.section-content pre code { background: none; padding: 0; color: inherit; }
.section-content blockquote {
  border-left: 3pt solid #5e6ad2;
  padding-left: 12pt;
  color: #555;
  margin: 10pt 0;
}
.section-content img { max-width: 100%; border-radius: 4pt; margin: 8pt 0; }
`;
