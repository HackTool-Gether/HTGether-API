import { TemplateVariableDto } from '../dto/create-template.dto';

export interface LibraryEntry {
  slug: string;
  name: string;
  description: string;
  category: string;
  htmlContent: string;
  cssContent: string;
  variables: TemplateVariableDto[];
}

// ---------------------------------------------------------------------------
// Shared CSS (same print-ready base for all templates)
// ---------------------------------------------------------------------------
const LIBRARY_CSS = `@page {
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

.cover-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80vh;
}
.cover-page h1 { font-size: 36pt; color: #5e6ad2; }
.cover-page .subtitle { font-size: 16pt; color: #666; margin-bottom: 40pt; }
.cover-meta p { font-size: 11pt; margin-bottom: 4pt; }

.toc { padding-left: 20pt; }
.toc li { margin-bottom: 6pt; font-size: 12pt; }

table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 12pt 0; }
th { background: #f0f0f5; text-align: left; padding: 8pt 10pt; font-weight: 600; border-bottom: 2px solid #ddd; }
td { padding: 6pt 10pt; border-bottom: 1px solid #eee; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 9pt; }

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

.finding { margin-bottom: 20pt; }
.finding-header { display: flex; align-items: center; gap: 10pt; margin-bottom: 6pt; }
.finding-slug { color: #888; font-size: 10pt; }
.cvss { color: #666; font-size: 9.5pt; margin-bottom: 10pt; }

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

// ---------------------------------------------------------------------------
// 1. Web / OWASP
// ---------------------------------------------------------------------------
const WEB_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <!-- Page de couverture -->
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Audit de securite applicative — OWASP</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
      <p><strong>Reference methodologique :</strong> {{ methodology_reference }}</p>
    </div>
  </div>

  <!-- Sommaire -->
  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie OWASP</li>
    <li>Outils utilises</li>
    <li>Resultats</li>
    <li>Vulnerabilites</li>
    <li>Statistiques</li>
  </ol>

  <!-- Methodologie OWASP -->
  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>L'audit a ete realise conformement au <strong>{{ methodology_reference }}</strong>. Les categories suivantes ont ete couvertes :</p>
  <ol>
    <li>Information Gathering</li>
    <li>Configuration & Deployment Management</li>
    <li>Identity Management & Authentication</li>
    <li>Authorization</li>
    <li>Session Management</li>
    <li>Input Validation</li>
    <li>Error Handling</li>
    <li>Cryptography</li>
    <li>Business Logic</li>
    <li>Client-side Testing</li>
  </ol>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  <!-- Sections du rapport -->
  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <!-- Tableau recapitulatif -->
  <div class="page-break"></div>
  <h2>Vulnerabilites</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  <!-- Detail des findings -->
  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
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

// ---------------------------------------------------------------------------
// 2. Active Directory
// ---------------------------------------------------------------------------
const AD_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <!-- Page de couverture -->
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Audit Active Directory</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Domaine :</strong> {{ domain_name }}</p>
      <p><strong>Nombre de DC :</strong> {{ dc_count }}</p>
    </div>
  </div>

  <!-- Sommaire -->
  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre AD</li>
    <li>Methodologie</li>
    <li>Phase 1 — Reconnaissance</li>
    <li>Phase 2 — Exploitation</li>
    <li>Phase 3 — Post-exploitation</li>
    <li>Vulnerabilites</li>
    <li>Statistiques</li>
  </ol>

  <!-- Methodologie -->
  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>L'audit de l'infrastructure Active Directory <strong>{{ domain_name }}</strong> a suivi une approche en trois phases :</p>
  <h3>Phase 1 — Reconnaissance</h3>
  <ul>
    <li>Enumeration des utilisateurs, groupes et GPO via LDAP</li>
    <li>Cartographie des relations de confiance (BloodHound)</li>
    <li>Identification des comptes a privileges et des delegations</li>
  </ul>
  <h3>Phase 2 — Exploitation</h3>
  <ul>
    <li>Attaques Kerberos (AS-REP Roasting, Kerberoasting)</li>
    <li>Relay NTLM et coercition d'authentification</li>
    <li>Exploitation des ACL et delegations abusives</li>
  </ul>
  <h3>Phase 3 — Post-exploitation</h3>
  <ul>
    <li>Mouvement lateral et escalade de privileges</li>
    <li>Extraction de secrets (DCSync, LSASS)</li>
    <li>Persistance (Golden Ticket, AdminSDHolder)</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  <!-- Sections du rapport -->
  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <!-- Tableau recapitulatif -->
  <div class="page-break"></div>
  <h2>Vulnerabilites</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
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

// ---------------------------------------------------------------------------
// 3. Linux Infrastructure
// ---------------------------------------------------------------------------
const LINUX_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <!-- Page de couverture -->
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Audit Infrastructure Linux</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
      <p><strong>Nombre de cibles :</strong> {{ target_count }}</p>
    </div>
  </div>

  <!-- Sommaire -->
  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie</li>
    <li>Decouverte reseau</li>
    <li>Enumeration des services</li>
    <li>Exploitation</li>
    <li>Escalade de privileges</li>
    <li>Vulnerabilites</li>
    <li>Statistiques</li>
  </ol>

  <!-- Methodologie -->
  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>L'audit des serveurs Linux a suivi les etapes suivantes :</p>
  <h3>Decouverte reseau</h3>
  <ul>
    <li>Scan de ports TCP/UDP (Nmap)</li>
    <li>Identification des services et versions</li>
    <li>Detection des systemes d'exploitation</li>
  </ul>
  <h3>Enumeration des services</h3>
  <ul>
    <li>SSH : versions, algorithmes, cles autorisees</li>
    <li>HTTP/HTTPS : serveurs web, applications, virtualhost</li>
    <li>SMB/NFS : partages, permissions</li>
    <li>Bases de donnees : ports exposes, authentification</li>
  </ul>
  <h3>Exploitation</h3>
  <ul>
    <li>Exploitation des services vulnrables</li>
    <li>Attaques par force brute ciblees</li>
    <li>Exploitation de configurations par defaut</li>
  </ul>
  <h3>Escalade de privileges</h3>
  <ul>
    <li>SUID/SGID, capabilities, cron jobs</li>
    <li>Kernel exploits, sudo misconfigurations</li>
    <li>Fichiers sensibles lisibles (GTFOBins)</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  <!-- Sections du rapport -->
  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <!-- Tableau recapitulatif -->
  <div class="page-break"></div>
  <h2>Vulnerabilites</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
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

// ---------------------------------------------------------------------------
// 4. Mobile
// ---------------------------------------------------------------------------
const MOBILE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <!-- Page de couverture -->
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Audit Application Mobile</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
      <p><strong>Plateforme :</strong> {{ platform }}</p>
    </div>
  </div>

  <!-- Sommaire -->
  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie</li>
    <li>Analyse statique</li>
    <li>Analyse dynamique</li>
    <li>Analyse reseau</li>
    <li>Stockage local</li>
    <li>Vulnerabilites</li>
    <li>Statistiques</li>
  </ol>

  <!-- Methodologie -->
  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>L'audit de l'application mobile ({{ platform }}) a ete conduit selon le <strong>OWASP Mobile Application Security Testing Guide (MASTG)</strong>.</p>
  <h3>Analyse statique</h3>
  <ul>
    <li>Decompilation et revue du code source (jadx / Hopper)</li>
    <li>Recherche de secrets codes en dur (cles API, tokens)</li>
    <li>Analyse des permissions declarees</li>
  </ul>
  <h3>Analyse dynamique</h3>
  <ul>
    <li>Hooking de fonctions sensibles (Frida / Objection)</li>
    <li>Contournement de la detection de root/jailbreak</li>
    <li>Bypass du SSL pinning</li>
    <li>Tests d'injection et de manipulation des intents/deep links</li>
  </ul>
  <h3>Analyse reseau</h3>
  <ul>
    <li>Interception du trafic (Burp Suite / mitmproxy)</li>
    <li>Verification du certificate pinning</li>
    <li>Analyse des endpoints API</li>
  </ul>
  <h3>Stockage local</h3>
  <ul>
    <li>Shared Preferences / Keychain</li>
    <li>Bases de donnees SQLite</li>
    <li>Fichiers caches et logs</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  <!-- Sections du rapport -->
  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <!-- Tableau recapitulatif -->
  <div class="page-break"></div>
  <h2>Vulnerabilites</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
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

// ---------------------------------------------------------------------------
// 5. Reconnaissance & OSINT
// ---------------------------------------------------------------------------
const RECON_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <!-- Page de couverture -->
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Reconnaissance & OSINT</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type de perimetre :</strong> {{ scope_type }}</p>
    </div>
  </div>

  <!-- Sommaire -->
  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie</li>
    <li>Reconnaissance passive</li>
    <li>Reconnaissance active</li>
    <li>Cartographie de la surface d'attaque</li>
    <li>Resultats</li>
    <li>Statistiques</li>
  </ol>

  <!-- Methodologie -->
  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>La mission de reconnaissance a cible le perimetre de type <strong>{{ scope_type }}</strong>.</p>
  <h3>Reconnaissance passive</h3>
  <ul>
    <li>Enumeration DNS et sous-domaines (Amass, Subfinder)</li>
    <li>Recherche de fuites de donnees et credentials (breach databases)</li>
    <li>Analyse des enregistrements WHOIS et certificats TLS</li>
    <li>Collecte d'informations sur les reseaux sociaux</li>
    <li>Google Dorks et recherche de fichiers exposes</li>
  </ul>
  <h3>Reconnaissance active</h3>
  <ul>
    <li>Scan de ports et identification de services (Nmap, Masscan)</li>
    <li>Enumeration des technologies web (Wappalyzer, WhatWeb)</li>
    <li>Recherche d'endpoints et de repertoires (ffuf, dirsearch)</li>
    <li>Scan de vulnerabilites superficiel (Nuclei)</li>
  </ul>
  <h3>Cartographie</h3>
  <ul>
    <li>Inventaire des actifs exposes sur Internet</li>
    <li>Cartographie des relations entre entites (Maltego)</li>
    <li>Identification des services cloud (Shodan, Censys)</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  <!-- Sections du rapport -->
  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <!-- Tableau recapitulatif -->
  <div class="page-break"></div>
  <h2>Resultats</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
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

// ---------------------------------------------------------------------------
// 6. Hardware / IoT
// ---------------------------------------------------------------------------
const HARDWARE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Audit Hardware / IoT</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
      <p><strong>Version firmware :</strong> {{ firmware_version }}</p>
    </div>
  </div>

  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie</li>
    <li>Analyse firmware</li>
    <li>Interfaces physiques</li>
    <li>Communications sans fil</li>
    <li>Vulnerabilites</li>
    <li>Statistiques</li>
  </ol>

  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>L'audit du systeme embarque a suivi une approche en quatre phases :</p>
  <h3>Reconnaissance hardware</h3>
  <ul>
    <li>Identification des composants electroniques (MCU, memoires, radios)</li>
    <li>Recherche de ports de debug (JTAG, UART, SPI, I2C)</li>
    <li>Dumping du firmware via interfaces physiques</li>
  </ul>
  <h3>Analyse firmware</h3>
  <ul>
    <li>Extraction et decompression du firmware (binwalk)</li>
    <li>Analyse du systeme de fichiers</li>
    <li>Recherche de secrets et backdoors codes en dur</li>
    <li>Revue des mecanismes de mise a jour (signature, chiffrement)</li>
  </ul>
  <h3>Interfaces de communication</h3>
  <ul>
    <li>Analyse des protocoles radio (BLE, ZigBee, LoRa, Z-Wave)</li>
    <li>Interception des communications serie</li>
    <li>Tests des API cloud associees</li>
  </ul>
  <h3>Exploitation</h3>
  <ul>
    <li>Injection de firmware modifie</li>
    <li>Attaques par canaux auxiliaires (glitching, SCA)</li>
    <li>Contournement des protections de debug</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <div class="page-break"></div>
  <h2>Vulnerabilites</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
  </div>
  {{/each}}

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

// ---------------------------------------------------------------------------
// 7. API REST / GraphQL
// ---------------------------------------------------------------------------
const API_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Audit API REST / GraphQL</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
      <p><strong>URL de base :</strong> {{ api_base_url }}</p>
    </div>
  </div>

  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie</li>
    <li>Authentification & Autorisation</li>
    <li>Injection & Validation</li>
    <li>Logique metier</li>
    <li>Vulnerabilites</li>
    <li>Statistiques</li>
  </ol>

  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>L'audit de l'API a ete conduit selon les recommandations de l'<strong>OWASP API Security Top 10</strong>.</p>
  <h3>Cartographie de l'API</h3>
  <ul>
    <li>Decouverte des endpoints (Swagger/OpenAPI, introspection GraphQL)</li>
    <li>Analyse des schemas et modeles de donnees</li>
    <li>Identification des mecanismes d'authentification (OAuth2, JWT, API keys)</li>
  </ul>
  <h3>Tests d'authentification</h3>
  <ul>
    <li>Brute force et credential stuffing</li>
    <li>Manipulation de tokens JWT (algorithme none, cle faible)</li>
    <li>Bypass des controles OAuth2 (redirect_uri, state)</li>
  </ul>
  <h3>Tests d'autorisation</h3>
  <ul>
    <li>BOLA / IDOR sur les ressources</li>
    <li>BFLA — acces aux fonctions non autorisees</li>
    <li>Mass assignment et champs caches</li>
  </ul>
  <h3>Injection et validation</h3>
  <ul>
    <li>Injection SQL/NoSQL via parametres API</li>
    <li>Injection dans les requetes GraphQL</li>
    <li>SSRF via parametres URL</li>
    <li>Abus de rate limiting et pagination</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <div class="page-break"></div>
  <h2>Vulnerabilites</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
  </div>
  {{/each}}

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

// ---------------------------------------------------------------------------
// 8. Cloud Security
// ---------------------------------------------------------------------------
const CLOUD_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Audit Securite Cloud</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
      <p><strong>Fournisseur cloud :</strong> {{ cloud_provider }}</p>
    </div>
  </div>

  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie</li>
    <li>IAM & Identites</li>
    <li>Stockage & Donnees</li>
    <li>Reseau & Exposition</li>
    <li>Vulnerabilites</li>
    <li>Statistiques</li>
  </ol>

  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>L'audit de l'infrastructure <strong>{{ cloud_provider }}</strong> a suivi les bonnes pratiques CIS Benchmarks et les recommandations du fournisseur.</p>
  <h3>Revue IAM</h3>
  <ul>
    <li>Audit des politiques IAM et des roles</li>
    <li>Recherche de permissions excessives (privilege escalation)</li>
    <li>Analyse des cles d'acces et politique de rotation</li>
    <li>Verification du MFA sur les comptes privilegies</li>
  </ul>
  <h3>Stockage et donnees</h3>
  <ul>
    <li>Buckets/Blobs publics ou mal configures</li>
    <li>Chiffrement des donnees au repos et en transit</li>
    <li>Logs et tracabilite (CloudTrail, Activity Log)</li>
  </ul>
  <h3>Reseau et exposition</h3>
  <ul>
    <li>Security Groups et Network ACLs</li>
    <li>Services exposes publiquement</li>
    <li>VPC peering et interconnexions</li>
  </ul>
  <h3>Services manages</h3>
  <ul>
    <li>Configurations des bases de donnees (RDS, CosmosDB)</li>
    <li>Fonctions serverless (Lambda, Functions)</li>
    <li>Conteneurs et orchestrateurs (EKS, AKS, GKE)</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <div class="page-break"></div>
  <h2>Vulnerabilites</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
  </div>
  {{/each}}

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

// ---------------------------------------------------------------------------
// 9. Wi-Fi / Wireless
// ---------------------------------------------------------------------------
const WIFI_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Audit Wi-Fi / Sans-fil</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
      <p><strong>Nombre de SSID :</strong> {{ ssid_count }}</p>
    </div>
  </div>

  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie</li>
    <li>Reconnaissance radio</li>
    <li>Attaques d'authentification</li>
    <li>Post-connexion</li>
    <li>Vulnerabilites</li>
    <li>Statistiques</li>
  </ol>

  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>L'audit des reseaux sans fil a couvert {{ ssid_count }} SSID identifies sur le perimetre.</p>
  <h3>Reconnaissance radio</h3>
  <ul>
    <li>Cartographie des reseaux (airodump-ng, Kismet)</li>
    <li>Identification des points d'acces et clients associes</li>
    <li>Analyse des protocoles de securite (WPA2/WPA3/WEP/Open)</li>
    <li>Detection de reseaux caches et points d'acces pirates</li>
  </ul>
  <h3>Attaques d'authentification</h3>
  <ul>
    <li>Capture de handshakes WPA2 (4-way handshake)</li>
    <li>Attaques par dictionnaire et brute force (hashcat)</li>
    <li>Evil Twin et portails captifs malveillants</li>
    <li>Attaques PMKID (sans client connecte)</li>
    <li>Downgrade WPA3 vers WPA2 (Dragonblood)</li>
  </ul>
  <h3>Post-connexion</h3>
  <ul>
    <li>ARP spoofing et attaques MITM</li>
    <li>Analyse du trafic reseau</li>
    <li>Pivoting vers le reseau interne</li>
    <li>Tests de segmentation VLAN</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <div class="page-break"></div>
  <h2>Vulnerabilites</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
  </div>
  {{/each}}

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

// ---------------------------------------------------------------------------
// 10. Social Engineering / Phishing
// ---------------------------------------------------------------------------
const SOCIAL_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ project_name }}</title>
</head>
<body>
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Social Engineering / Phishing</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Date :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type :</strong> {{ audit_type }}</p>
      <p><strong>Nombre de cibles :</strong> {{ target_count }}</p>
    </div>
  </div>

  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Synthese</li>
    <li>Perimetre</li>
    <li>Methodologie</li>
    <li>Reconnaissance OSINT</li>
    <li>Campagne de phishing</li>
    <li>Ingenierie sociale physique</li>
    <li>Resultats</li>
    <li>Statistiques</li>
  </ol>

  <div class="page-break"></div>
  <h2>Methodologie</h2>
  <p>La campagne de social engineering a cible {{ target_count }} collaborateurs identifies lors de la phase de reconnaissance.</p>
  <h3>Reconnaissance OSINT</h3>
  <ul>
    <li>Collecte d'adresses email (theHarvester, Hunter.io)</li>
    <li>Analyse des reseaux sociaux des employes</li>
    <li>Identification de l'organigramme et des cibles prioritaires</li>
    <li>Recherche de fuites de donnees existantes</li>
  </ul>
  <h3>Campagne de phishing</h3>
  <ul>
    <li>Creation des pretextes et scenarios</li>
    <li>Mise en place de l'infrastructure (GoPhish)</li>
    <li>Envoi des emails et suivi des interactions</li>
    <li>Analyse des taux de clic et soumission de credentials</li>
    <li>Deploiement de pages de phishing (Evilginx)</li>
  </ul>
  <h3>Tests physiques</h3>
  <ul>
    <li>Tentatives de tailgating (acces aux locaux)</li>
    <li>Tests de cles USB (rubber ducky, drops)</li>
    <li>Appels de vishing (pretexte telephonique)</li>
    <li>Tests de badges et controles d'acces</li>
  </ul>
  <p><strong>Outils :</strong> {{ tools_used }}</p>

  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <div class="page-break"></div>
  <h2>Resultats</h2>
  <table class="findings-table">
    <thead>
      <tr><th>Ref</th><th>Titre</th><th>Severite</th><th>CVSS</th><th>Statut</th></tr>
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

  {{#each findings}}
  <div class="page-break"></div>
  <div class="finding">
    <div class="finding-header">
      <span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span>
      <span class="finding-slug mono">{{ this.slug }}</span>
    </div>
    <h3>{{ this.title }}</h3>
    {{#if this.cvss_vector}}<p class="cvss mono">CVSS : {{ this.cvss_score }} — {{ this.cvss_vector }}</p>{{/if}}
    {{#if this.description_html}}<h4>Description</h4><div>{{{ this.description_html }}}</div>{{/if}}
    {{#if this.proof_html}}<h4>Preuve</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remediation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>References</h4><p>{{ this.references }}</p>{{/if}}
  </div>
  {{/each}}

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

// ---------------------------------------------------------------------------
// Library entries
// ---------------------------------------------------------------------------
export const TEMPLATE_LIBRARY: LibraryEntry[] = [
  {
    slug: 'web',
    name: 'Pentest Web — OWASP',
    description:
      "Template oriente audit d'applications web, base sur l'OWASP Top 10",
    category: 'web',
    htmlContent: WEB_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'methodology_reference',
        label: 'Reference methodologique',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'OWASP Testing Guide v4.2',
        required: false,
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'Burp Suite, Nuclei, ffuf',
        required: false,
      },
    ],
  },
  {
    slug: 'ad',
    name: 'Pentest Active Directory',
    description:
      "Template pour audits d'infrastructure Active Directory",
    category: 'ad',
    htmlContent: AD_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'domain_name',
        label: 'Nom de domaine AD',
        type: 'string',
        category: 'Perimetre',
        required: true,
      },
      {
        id: 'dc_count',
        label: 'Nombre de Domain Controllers',
        type: 'number',
        category: 'Perimetre',
        required: false,
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'BloodHound, Impacket, CrackMapExec, Rubeus',
        required: false,
      },
    ],
  },
  {
    slug: 'linux',
    name: 'Pentest Infrastructure Linux',
    description:
      'Template pour audits de serveurs et services Linux',
    category: 'linux',
    htmlContent: LINUX_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'target_count',
        label: 'Nombre de cibles',
        type: 'number',
        category: 'Perimetre',
        required: false,
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'Nmap, LinPEAS, pspy, GTFOBins',
        required: false,
      },
    ],
  },
  {
    slug: 'mobile',
    name: 'Pentest Application Mobile',
    description:
      "Template pour audits d'applications iOS et Android",
    category: 'mobile',
    htmlContent: MOBILE_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'platform',
        label: 'Plateforme',
        type: 'enum',
        category: 'Perimetre',
        defaultValue: 'Les deux',
        required: true,
        options: [
          { value: 'iOS', label: 'iOS' },
          { value: 'Android', label: 'Android' },
          { value: 'Les deux', label: 'Les deux' },
        ],
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'Frida, MobSF, Objection, jadx',
        required: false,
      },
    ],
  },
  {
    slug: 'recon',
    name: 'Reconnaissance & OSINT',
    description:
      'Template pour missions de reconnaissance et cartographie',
    category: 'recon',
    htmlContent: RECON_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'scope_type',
        label: 'Type de perimetre',
        type: 'enum',
        category: 'Perimetre',
        defaultValue: 'Domaine',
        required: true,
        options: [
          { value: 'Domaine', label: 'Domaine' },
          { value: 'Organisation', label: 'Organisation' },
          { value: 'Personne', label: 'Personne' },
        ],
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'Amass, theHarvester, Shodan, Maltego',
        required: false,
      },
    ],
  },
  {
    slug: 'hardware',
    name: 'Pentest Hardware / IoT',
    description:
      "Template pour audits de systemes embarques, IoT et hardware",
    category: 'hardware',
    htmlContent: HARDWARE_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'firmware_version',
        label: 'Version firmware',
        type: 'string',
        category: 'Perimetre',
        required: false,
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'binwalk, Ghidra, Logic Analyzer, Bus Pirate, nRF Connect',
        required: false,
      },
    ],
  },
  {
    slug: 'api',
    name: 'Pentest API REST / GraphQL',
    description:
      "Template pour audits de securite d'APIs REST et GraphQL",
    category: 'api',
    htmlContent: API_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'api_base_url',
        label: 'URL de base de l\'API',
        type: 'string',
        category: 'Perimetre',
        required: true,
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'Burp Suite, Postman, GraphQL Voyager, jwt_tool',
        required: false,
      },
    ],
  },
  {
    slug: 'cloud',
    name: 'Audit Securite Cloud',
    description:
      "Template pour audits d'infrastructures cloud (AWS, Azure, GCP)",
    category: 'cloud',
    htmlContent: CLOUD_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'cloud_provider',
        label: 'Fournisseur cloud',
        type: 'enum',
        category: 'Perimetre',
        defaultValue: 'AWS',
        required: true,
        options: [
          { value: 'AWS', label: 'AWS' },
          { value: 'Azure', label: 'Azure' },
          { value: 'GCP', label: 'GCP' },
          { value: 'Multi-cloud', label: 'Multi-cloud' },
        ],
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'ScoutSuite, Prowler, CloudSploit, Pacu',
        required: false,
      },
    ],
  },
  {
    slug: 'wifi',
    name: 'Pentest Wi-Fi / Sans-fil',
    description:
      'Template pour audits de securite des reseaux sans fil',
    category: 'wifi',
    htmlContent: WIFI_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'ssid_count',
        label: 'Nombre de SSID',
        type: 'number',
        category: 'Perimetre',
        required: false,
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'Aircrack-ng, Wireshark, hostapd, bettercap',
        required: false,
      },
    ],
  },
  {
    slug: 'social',
    name: 'Social Engineering / Phishing',
    description:
      'Template pour campagnes de sensibilisation et tests de phishing',
    category: 'social',
    htmlContent: SOCIAL_HTML,
    cssContent: LIBRARY_CSS,
    variables: [
      {
        id: 'target_count',
        label: 'Nombre de cibles',
        type: 'number',
        category: 'Perimetre',
        required: false,
      },
      {
        id: 'tools_used',
        label: 'Outils utilises',
        type: 'string',
        category: 'Methodologie',
        defaultValue: 'GoPhish, SET, theHarvester, Evilginx',
        required: false,
      },
    ],
  },
];
