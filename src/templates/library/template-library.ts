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
  <!-- Couverture -->
  <div class="cover-page">
    <h1>{{ project_name }}</h1>
    <p class="subtitle">Test d'intrusion IoT / Objets connectés &amp; systèmes embarqués</p>
    <div class="cover-meta">
      <p><strong>Client :</strong> {{ client_company }}</p>
      <p><strong>Période :</strong> {{ start_date }} — {{ end_date }}</p>
      <p><strong>Type d'audit :</strong> {{ audit_type }}</p>
      {{#if product_name}}<p><strong>Produit :</strong> {{ product_name }}</p>{{/if}}
      {{#if device_model}}<p><strong>Modèle :</strong> {{ device_model }}</p>{{/if}}
      {{#if firmware_version}}<p><strong>Firmware :</strong> {{ firmware_version }}</p>{{/if}}
    </div>
    <p class="cover-note">Méthodologie : {{ methodology_reference }}</p>
  </div>

  <!-- Sommaire -->
  <div class="page-break"></div>
  <h2>Sommaire</h2>
  <ol class="toc">
    <li>Résumé exécutif et posture de risque</li>
    <li>Identification de l'équipement testé (DUT)</li>
    <li>Périmètre et règles d'engagement</li>
    <li>Référentiels et méthodologie</li>
    <li>Matrice de couverture des surfaces d'attaque</li>
    <li>Constats détaillés (vulnérabilités)</li>
    <li>Chaînes d'attaque et pivoting</li>
    <li>Matrice de conformité</li>
    <li>Statistiques</li>
    <li>Annexes et références</li>
  </ol>

  <!-- 1. Identification de l'équipement testé -->
  <div class="page-break"></div>
  <h2>Identification de l'équipement testé (DUT)</h2>
  <p>Le présent rapport documente le test d'intrusion de l'unité physique ci-dessous. L'empreinte du firmware garantit la traçabilité et la reproductibilité du re-test.</p>
  <table class="meta-table">
    <tbody>
      {{#if product_name}}<tr><th>Nom commercial</th><td>{{ product_name }}</td></tr>{{/if}}
      {{#if device_model}}<tr><th>Modèle</th><td>{{ device_model }}</td></tr>{{/if}}
      {{#if hardware_revision}}<tr><th>Révision matérielle / PCB</th><td>{{ hardware_revision }}</td></tr>{{/if}}
      {{#if firmware_version}}<tr><th>Version firmware</th><td>{{ firmware_version }}</td></tr>{{/if}}
      {{#if firmware_sha256}}<tr><th>Empreinte SHA-256</th><td class="mono">{{ firmware_sha256 }}</td></tr>{{/if}}
      {{#if fcc_id}}<tr><th>FCC ID</th><td class="mono">{{ fcc_id }}</td></tr>{{/if}}
      {{#if serial_batch}}<tr><th>N° de série / lot</th><td>{{ serial_batch }}</td></tr>{{/if}}
      {{#if chipset_inventory}}<tr><th>Composants (MCU, flash, radio)</th><td>{{ chipset_inventory }}</td></tr>{{/if}}
      {{#if radio_protocols}}<tr><th>Protocoles radio</th><td>{{ radio_protocols }}</td></tr>{{/if}}
    </tbody>
  </table>

  <!-- 2. Périmètre et règles d'engagement -->
  <div class="page-break"></div>
  <h2>Périmètre et règles d'engagement</h2>
  <p>Conformément à la phase de pré-engagement (PTES), les vecteurs et contraintes opérationnelles ont été cadrés avec le client avant toute manipulation.</p>
  <table class="meta-table">
    <tbody>
      {{#if ecosystem_scope}}<tr><th>Périmètre écosystème</th><td>{{ ecosystem_scope }}</td></tr>{{/if}}
      {{#if companion_app}}<tr><th>Application compagnon</th><td>{{ companion_app }}</td></tr>{{/if}}
      {{#if cloud_backend}}<tr><th>Backend cloud / API</th><td>{{ cloud_backend }}</td></tr>{{/if}}
      {{#if physical_access_level}}<tr><th>Niveau d'accès physique (ISTG)</th><td>{{ physical_access_level }}</td></tr>{{/if}}
      {{#if teardown_authorized}}<tr><th>Démontage destructif / chip-off</th><td>{{ teardown_authorized }}</td></tr>{{/if}}
      {{#if bricking_tolerance}}<tr><th>Tolérance au bricking</th><td>{{ bricking_tolerance }}</td></tr>{{/if}}
      {{#if rf_emission_limits}}<tr><th>Contraintes RF</th><td>{{ rf_emission_limits }}</td></tr>{{/if}}
    </tbody>
  </table>
  {{#if scopes.length}}
  <h3>Périmètres techniques</h3>
  <table>
    <thead><tr><th>Périmètre</th><th>Description</th><th>Statut</th></tr></thead>
    <tbody>
      {{#each scopes}}
      <tr><td>{{ this.name }}</td><td>{{ this.description }}</td><td>{{ this.status }}</td></tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  <!-- 3. Référentiels et méthodologie -->
  <div class="page-break"></div>
  <h2>Référentiels et méthodologie</h2>
  <p>L'audit croise trois cadres reconnus : le modèle composant en 8 surfaces de l'<strong>OWASP IoT Security Testing Guide (ISTG, 2024)</strong>, les 9 étapes de l'<strong>OWASP Firmware Security Testing Methodology (FSTM)</strong> pour le firmware, et les 7 phases du <strong>PTES</strong> pour l'engagement. Chaque constat est rattaché à un identifiant de cas de test ISTG (ex. <span class="mono">ISTG-FW-INFO-001</span>) et classé selon l'<strong>OWASP IoT Top 10 (2018)</strong>. Le modèle attaquant ISTG (accès physique PA-1 à PA-4, authentification AA-1 à AA-4) cadre les hypothèses de menace.</p>
  <p class="ref-line"><strong>Référentiels mobilisés :</strong> OWASP ISTG · OWASP FSTM · OWASP ISVS (Pre-release 1.0RC) · OWASP IoT Top 10 (2018) · ETSI EN 303 645 V3.1.3 · NIST IR 8259A / 8425 · IoTSF Security Assurance Framework · OWASP MASVS v2.0 / MASTG (application compagnon) · OWASP API Security Top 10 (API1 BOLA).</p>

  <h3>1. Reconnaissance et modélisation des menaces</h3>
  <ul>
    <li>Pré-engagement et règles d'engagement (vecteurs autorisés, tolérance au bricking, démontage)</li>
    <li>Collecte d'informations (FSTM étape 1) : documentation, FCC ID, datasheets, firmware fournisseur</li>
    <li>Décomposition de l'écosystème en surfaces ISTG et cartographie des frontières de confiance</li>
    <li>Modélisation des menaces et priorisation des chemins de pivoting inter-couches</li>
  </ul>
  <h3>2. Sécurité matérielle et interfaces de débogage</h3>
  <ul>
    <li>Reconnaissance PCB, identification des composants, repérage des test points / headers</li>
    <li>Découverte et exploitation UART (shell root, interruption du bootloader U-Boot)</li>
    <li>Découverte JTAG/SWD : halt, single-step, dump de flash, contournement de read-out protection</li>
    <li>Dump de flash SPI NOR / EEPROM I2C en circuit (clip SOIC-8) ; chip-off eMMC/NAND si verrouillé</li>
    <li>Fault injection (glitch tension/horloge/EM) et canaux auxiliaires (DPA/CPA) pour bypass secure boot / récupération de clés</li>
  </ul>
  <p class="tools-line"><strong>Outils :</strong> {{ hardware_tools }}</p>
  <h3>3. Extraction et analyse du firmware (FSTM)</h3>
  <ul>
    <li>Acquisition de l'image (téléchargement, capture OTA, dump matériel ou chip-off)</li>
    <li>Extraction du système de fichiers (scan signature/entropie, extraction récursive)</li>
    <li>Chasse aux secrets codés en dur : comptes backdoor, clés privées, certificats TLS, tokens API</li>
    <li>Rétro-ingénierie des binaires (ARM/MIPS) et recherche de fonctions de debug/backdoor</li>
    <li>Émulation et analyse dynamique ; SBOM et corrélation CVE des composants obsolètes</li>
  </ul>
  <p class="tools-line"><strong>Outils :</strong> {{ firmware_tools }}</p>
  <h3>4. Services réseau et interface d'administration</h3>
  <ul>
    <li>Scan TCP/UDP et fingerprinting (telnet, SSH, FTP, UPnP/SSDP, mDNS, RTSP, propriétaires)</li>
    <li>Authentifications par défaut/faibles/absentes, fuzzing de protocoles</li>
    <li>Interface web/admin : contournement d'auth, CSRF, XSS, injection de commandes, IDOR, abus d'upload firmware</li>
    <li>Courtiers MQTT/CoAP : accès anonyme, abonnement wildcard, abus d'ACL de topics</li>
  </ul>
  <h3>5. Communications, TLS et tests radio/RF</h3>
  <ul>
    <li>MITM appareil-cloud/app : version TLS, validation de certificat (self-signed, nom d'hôte, pinning), downgrade en clair</li>
    <li>BLE : sniffing, faiblesse d'appairage Just Works, downgrade LE Secure Connections, hijack</li>
    <li>Zigbee/Z-Wave : sniff/replay, extraction de clé, downgrade S2→S0 (Z-Shave)</li>
    <li>LoRaWAN : rejeu DevNonce/FCnt sur implémentations faibles, DoS de jointure (Join Requests en clair mais authentifiées par MIC)</li>
    <li>Wi-Fi : deauth, capture handshake/PMKID, evil-twin ; sub-GHz : rejeu de code fixe, défaite de rolling code (RollJam)</li>
  </ul>
  <p class="tools-line"><strong>Outils :</strong> {{ radio_tools }}</p>
  <h3>6. Backend cloud, API fournisseur et écosystème</h3>
  <ul>
    <li>Cartographie des endpoints API depuis le trafic mobile intercepté</li>
    <li>Autorisation inter-utilisateur/inter-appareil (BOLA/IDOR) : permutation d'ID d'appareil, série, MAC</li>
    <li>Prise de contrôle de propriété via le flux de revendication d'appareil (device-claiming)</li>
    <li>Mass assignment, rate limiting, injections ; frontières de confiance vers clouds tiers (tokens OAuth)</li>
  </ul>
  <h3>7. Application mobile compagnon (MASVS / MASTG)</h3>
  <ul>
    <li>Analyse statique : secrets/endpoints/clés codés en dur, stockage local, certificats client embarqués</li>
    <li>Analyse dynamique : interception, contournement du certificate pinning, résilience root/Frida</li>
    <li>Traçage des API de contrôle et des tokens pour alimenter les tests d'autorisation cloud</li>
  </ul>
  <h3>8. Mécanisme de mise à jour / OTA</h3>
  <ul>
    <li>Vérification de signature et d'intégrité (rejet d'images non signées même depuis un serveur compromis)</li>
    <li>Chiffrement du canal (TLS/mTLS), protection anti-rollback/downgrade</li>
    <li>Spoofing/MITM du serveur de mise à jour par injection d'images modifiées</li>
  </ul>
  <h3>9. Exploitation, post-exploitation et reporting</h3>
  <ul>
    <li>Développement de PoC, élévation de privilèges, exécution de code (FSTM étape 9)</li>
    <li>Pivoting inter-couches démontrant l'effondrement de la chaîne de confiance et le rayon d'impact flotte</li>
    <li>Notation IoT-aware : CVSS complété de l'accès physique requis, du blast radius et de la chaîne de confiance</li>
  </ul>

  <!-- 4. Matrice de couverture -->
  <div class="page-break"></div>
  <h2>Matrice de couverture des surfaces d'attaque</h2>
  <p>Surfaces d'attaque IoT (modèle OWASP ISTG / IoT Attack Surface) et techniques de test associées.</p>
  <table class="coverage-table">
    <thead><tr><th>Surface d'attaque</th><th>Tests réalisés</th></tr></thead>
    <tbody>
      <tr><td>Interfaces physiques (ISTG-PHY / INT)</td><td>Énumération UART/JTAG/SWD/SPI/I2C, shell root, dump de flash / chip-off, tamper, canaux auxiliaires &amp; fault injection</td></tr>
      <tr><td>Firmware (ISTG-FW / FSTM)</td><td>Acquisition, extraction du FS, secrets codés en dur, backdoors, CVE connues (SBOM), crypto, rétro-ingénierie, émulation</td></tr>
      <tr><td>Mémoire (ISTG-MEM)</td><td>Lecture flash/EEPROM, chiffrement au repos, read-out protection, récupération de clés/tokens</td></tr>
      <tr><td>Services réseau (ISTG-DES)</td><td>Scan TCP/UDP, fingerprinting, auth par défaut/faibles, fuzzing, MQTT/CoAP, résilience DoS</td></tr>
      <tr><td>Interface web / admin (ISTG-UI)</td><td>Creds par défaut, contournement d'auth, session, CSRF, XSS, injection, IDOR, upload firmware</td></tr>
      <tr><td>Stockage local</td><td>Données sensibles non chiffrées, config/identifiants en clair, permissions faibles, élément sécurisé</td></tr>
      <tr><td>Communications / TLS</td><td>MITM, version/cipher TLS, validation de certificat, pinning, downgrade, rejeu</td></tr>
      <tr><td>Radio / RF (ISTG-WRLS)</td><td>BLE, Zigbee/Z-Wave, Wi-Fi, LoRaWAN, sub-GHz : appairage, chiffrement, replay, downgrade, extraction de clé</td></tr>
      <tr><td>Backend cloud / API</td><td>Authn/authz, BOLA/IDOR, device-claiming, mass assignment, ACL MQTT, rate limiting, injections</td></tr>
      <tr><td>Application mobile compagnon</td><td>Secrets statiques, stockage local, cert-pinning, interception, deeplinks, API de contrôle</td></tr>
      <tr><td>Mise à jour / OTA (ISTG-FW UPDT)</td><td>Signature/intégrité, chiffrement du canal, anti-rollback, MITM/spoofing du serveur</td></tr>
      <tr><td>Vie privée / données</td><td>Données personnelles collectées/transmises, collecte excessive, exposition tiers, fuite de métadonnées</td></tr>
      <tr><td>Secure boot / chaîne de confiance</td><td>Vérification de chaque étape de boot, fault injection sur la branche de contrôle, ports de debug non fusionnés</td></tr>
    </tbody>
  </table>

  <!-- Sections rédigées (synthèse, narratif…) -->
  {{#each sections}}
  <div class="page-break"></div>
  <h2>{{ this.title }}</h2>
  <div class="section-content">{{{ this.content_html }}}</div>
  {{/each}}

  <!-- 5. Constats détaillés -->
  <div class="page-break"></div>
  <h2>Constats détaillés (vulnérabilités)</h2>
  <p class="rating-note">Notation IoT-aware : le score CVSS est complété, en commentaire de chaque constat, par le niveau d'accès physique requis, le rayon d'impact à l'échelle de la flotte (blast radius) et l'éventuel effondrement de la chaîne de confiance.</p>
  <table class="findings-table">
    <thead>
      <tr><th>Réf</th><th>Titre</th><th>Sévérité</th><th>CVSS</th><th>Statut</th></tr>
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
    {{#if this.proof_html}}<h4>Preuve de concept</h4><div>{{{ this.proof_html }}}</div>{{/if}}
    {{#if this.impact_html}}<h4>Impact</h4><div>{{{ this.impact_html }}}</div>{{/if}}
    {{#if this.remediation_html}}<h4>Remédiation</h4><div>{{{ this.remediation_html }}}</div>{{/if}}
    {{#if this.references}}<h4>Références</h4><p>{{ this.references }}</p>{{/if}}
  </div>
  {{/each}}

  <!-- 6. Chaînes d'attaque -->
  {{#if attack_chains.length}}
  <div class="page-break"></div>
  <h2>Chaînes d'attaque et pivoting</h2>
  <p>Démonstration des chemins d'exploitation inter-couches (ex. shell root UART → firmware extrait → clés → API cloud → compromission de flotte).</p>
  {{#each attack_chains}}
  <div class="chain">
    <h3>{{ this.name }}</h3>
    {{#if this.description_html}}<div class="section-content">{{{ this.description_html }}}</div>{{/if}}
    <ol class="chain-steps">
      {{#each this.findings}}
      <li><span class="severity severity-{{ this.severity_lower }}">{{ this.severity }}</span> {{ this.title }} <span class="mono">{{ this.slug }}</span></li>
      {{/each}}
    </ol>
  </div>
  {{/each}}
  {{/if}}

  <!-- 7. Matrice de conformité -->
  <div class="page-break"></div>
  <h2>Matrice de conformité</h2>
  <p>Cible de conformité : <strong>{{ compliance_baseline }}</strong>{{#if assurance_class}} — classe d'assurance visée : <strong>{{ assurance_class }}</strong>{{/if}}. Les constats sont rattachés aux référentiels ci-dessous.</p>
  <table class="meta-table">
    <tbody>
      <tr><th>ETSI EN 303 645 V3.1.3</th><td>13 provisions de la clause 5 (pas de mot de passe par défaut, mises à jour, stockage sécurisé, communications sécurisées…) + clause 6 (données personnelles)</td></tr>
      <tr><th>OWASP ISVS (Pre-release 1.0RC)</th><td>V1 Écosystème · V2 Application · V3 Plateforme logicielle · V4 Communication · V5 Plateforme matérielle</td></tr>
      <tr><th>NIST IR 8259A / 8425</th><td>6 capacités cœur de l'appareil ; profil produit grand public (socle du FCC Cyber Trust Mark)</td></tr>
      <tr><th>IoTSF Security Assurance Framework</th><td>Détermination de la classe d'assurance (0 à 4) et preuve exigence par exigence</td></tr>
      <tr><th>EU RED EN 18031 / CRA</th><td>Cybersécurité des équipements radio (obligatoire depuis le 01/08/2025) ; SBOM machine-readable (CRA)</td></tr>
    </tbody>
  </table>

  <!-- 8. Statistiques -->
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

  <!-- 9. Annexes et références -->
  <div class="page-break"></div>
  <h2>Annexes et références</h2>
  <p>Livrables d'annexe : liste des outils, photos de démontage et d'interfaces, identification des puces (datasheets), empreintes des images firmware, SBOM (CycloneDX/SPDX), captures PCAP/IQ et code des PoC.</p>
  <h3>Références méthodologiques</h3>
  <ul class="ref-list">
    <li>OWASP Firmware Security Testing Methodology (FSTM)</li>
    <li>OWASP IoT Security Testing Guide (ISTG, 2024)</li>
    <li>OWASP IoT Security Verification Standard (ISVS, Pre-release 1.0RC)</li>
    <li>OWASP IoT Top 10 (2018) &amp; IoT Attack Surface Areas</li>
    <li>ETSI EN 303 645 V3.1.3 (2024-09) — Cyber Security for Consumer IoT</li>
    <li>NIST IR 8259A &amp; NIST IR 8425 (profil IoT grand public)</li>
    <li>IoT Security Foundation — Security Assurance Framework</li>
    <li>OWASP MASVS v2.0 &amp; MASTG (application mobile compagnon)</li>
    <li>OWASP API Security Top 10 — API1:2023 BOLA</li>
    <li>PTES — Penetration Testing Execution Standard</li>
  </ul>
</body>
</html>`;

const HARDWARE_CSS =
  LIBRARY_CSS +
  `
.cover-note { font-size: 10pt; color: #888; margin-top: 24pt; }
.meta-table th { width: 38%; background: #f8f8fc; color: #444; font-weight: 600; vertical-align: top; }
.meta-table td { vertical-align: top; }
.coverage-table th:first-child { width: 34%; }
.coverage-table td { font-size: 9pt; }
.ref-line { font-size: 9.5pt; color: #555; background: #f8f8fc; border-left: 3pt solid #5e6ad2; padding: 8pt 12pt; border-radius: 4pt; }
.tools-line { font-size: 9.5pt; color: #5e6ad2; margin: 4pt 0 12pt; }
.rating-note { font-size: 9.5pt; color: #555; font-style: italic; margin-bottom: 10pt; }
.chain { margin-bottom: 16pt; }
.chain-steps { padding-left: 18pt; }
.chain-steps li { margin-bottom: 5pt; }
.ref-list { padding-left: 18pt; }
.ref-list li { margin-bottom: 4pt; font-size: 9.5pt; }
`;

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
    name: 'Pentest IoT / Hardware & systèmes embarqués',
    description:
      "Audit de sécurité IoT bout-en-bout (matériel, firmware, radio/RF, services réseau, backend cloud/API, app compagnon), aligné OWASP FSTM / ISTG / ISVS, ETSI EN 303 645 et NIST IR 8259A/8425",
    category: 'hardware',
    htmlContent: HARDWARE_HTML,
    cssContent: HARDWARE_CSS,
    variables: [
      // Identification de l'équipement testé (DUT)
      { id: 'product_name', label: 'Nom commercial du produit', type: 'string', category: 'Identification (DUT)', required: false },
      { id: 'device_model', label: "Modèle de l'appareil", type: 'string', category: 'Identification (DUT)', required: false },
      { id: 'hardware_revision', label: 'Révision matérielle / PCB', type: 'string', category: 'Identification (DUT)', required: false },
      { id: 'firmware_version', label: 'Version du firmware', type: 'string', category: 'Identification (DUT)', required: false },
      { id: 'firmware_sha256', label: "Empreinte SHA-256 de l'image firmware", type: 'string', category: 'Identification (DUT)', required: false },
      { id: 'fcc_id', label: 'FCC ID', type: 'string', category: 'Identification (DUT)', required: false },
      { id: 'serial_batch', label: 'Numéro de série / lot', type: 'string', category: 'Identification (DUT)', required: false },
      { id: 'chipset_inventory', label: 'Inventaire des composants (MCU/SoC, flash, radio)', type: 'string', category: 'Identification (DUT)', required: false },
      // Périmètre
      { id: 'radio_protocols', label: 'Protocoles radio supportés', type: 'string', category: 'Périmètre', defaultValue: 'Wi-Fi, BLE, Zigbee', required: false },
      { id: 'ecosystem_scope', label: 'Périmètre écosystème (appareil / passerelle / cloud / app)', type: 'string', category: 'Périmètre', defaultValue: 'Appareil, Cloud/API, Application mobile', required: false },
      { id: 'companion_app', label: 'Application mobile compagnon (nom / plateformes)', type: 'string', category: 'Périmètre', required: false },
      { id: 'cloud_backend', label: 'Backend cloud / endpoints API', type: 'string', category: 'Périmètre', required: false },
      // Règles d'engagement
      { id: 'physical_access_level', label: "Niveau d'accès physique (modèle ISTG PA-1..PA-4)", type: 'string', category: "Règles d'engagement", defaultValue: 'PA-3 (ouverture du boîtier autorisée)', required: false },
      { id: 'teardown_authorized', label: 'Démontage destructif / chip-off autorisé', type: 'string', category: "Règles d'engagement", defaultValue: 'Oui', required: false },
      { id: 'bricking_tolerance', label: 'Tolérance au bricking / perte de données', type: 'string', category: "Règles d'engagement", defaultValue: 'Unités de test sacrificielles fournies', required: false },
      { id: 'rf_emission_limits', label: "Contraintes / limites d'émission RF", type: 'string', category: "Règles d'engagement", defaultValue: 'Banc isolé / cage de Faraday', required: false },
      // Méthodologie
      { id: 'methodology_reference', label: 'Référence méthodologique', type: 'string', category: 'Méthodologie', defaultValue: 'OWASP FSTM + OWASP ISTG (2024) + PTES', required: false },
      { id: 'hardware_tools', label: 'Outils matériels utilisés', type: 'string', category: 'Méthodologie', defaultValue: 'Tigard, JTAGulator, Saleae, flashrom/CH341A, ChipWhisperer', required: false },
      { id: 'firmware_tools', label: "Outils d'analyse firmware utilisés", type: 'string', category: 'Méthodologie', defaultValue: 'binwalk, unblob, EMBA, Ghidra, firmwalker, TruffleHog', required: false },
      { id: 'radio_tools', label: 'Outils radio/RF utilisés', type: 'string', category: 'Méthodologie', defaultValue: 'HackRF One, Sniffle, Ubertooth One, KillerBee, YARD Stick One, URH', required: false },
      // Conformité
      { id: 'compliance_baseline', label: 'Référentiel de conformité ciblé', type: 'string', category: 'Conformité', defaultValue: 'ETSI EN 303 645 V3.1.3 + EN 18031 (RED)', required: false },
      { id: 'assurance_class', label: "Classe d'assurance IoTSF visée", type: 'string', category: 'Conformité', defaultValue: 'Classe 2', required: false },
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
