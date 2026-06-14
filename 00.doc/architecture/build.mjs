#!/usr/bin/env node
/**
 * 02.arch/*.md + config schema docs → index.html (SSOT 미러)
 * Run: npm run build --prefix 00.doc/architecture
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARCH_ROOT = join(__dirname, "../../02.arch");
const OUT = join(__dirname, "index.html");

/** @type {{ group: string; title: string; files: { rel: string; label?: string }[] }[]} */
const MANIFEST = [
  {
    group: "overview",
    title: "개요",
    files: [{ rel: "01-platform-overview.md", label: "① 플랫폼 개요" }],
  },
  {
    group: "pipeline",
    title: "데이터 처리 · 파이프라인",
    files: [{ rel: "02-data-pipeline.md", label: "② AWS 파이프라인" }],
  },
  {
    group: "media",
    title: "미디어 · S3",
    files: [
      { rel: "13-media-upload-pipeline.md", label: "⑬ 미디어 업로드" },
      { rel: "config/samples/mqtt-topics.md", label: "MQTT 토픽 (file 포함)" },
    ],
  },
  {
    group: "edge",
    title: "Greengrass · 엣지",
    files: [
      { rel: "08-greengrass-offline-resilience.md", label: "⑦ 오프라인 · 복구" },
    ],
  },
  {
    group: "ai",
    title: "알람 · AI · 자가복구",
    files: [
      {
        rel: "09-ai-anomaly-rules-and-edge-self-healing.md",
        label: "⑧ AI · 룰 추천 · self-heal",
      },
    ],
  },
  {
    group: "storage",
    title: "3-Tier Storage",
    files: [{ rel: "03-storage-tiers.md", label: "③ 저장 Tier" }],
  },
  {
    group: "backend",
    title: "백엔드 · Lambda",
    files: [
      { rel: "04-backend-services.md", label: "④ 백엔드 MSA" },
      { rel: "14-backend-frontend-design.md", label: "⑭ UI · API · NestJS" },
      { rel: "15-lambda-development.md", label: "⑮ AWS Lambda 개발" },
      { rel: "16-local-e2e-testing.md", label: "⑯ 로컬 E2E · Podman" },
    ],
  },
  {
    group: "yaml",
    title: "YAML · 규칙 · Cadence",
    files: [
      { rel: "05-yaml-and-rules.md", label: "⑤ YAML 4층 · MQTT" },
      { rel: "10-yaml-pipeline-deploy-automation.md", label: "⑩ predeploy · Terraform" },
    ],
  },
  {
    group: "database",
    title: "DB 설계",
    files: [
      { rel: "06-schema-reference.md", label: "⑥ 스키마 · UI 매핑" },
      { rel: "12-database-design.md", label: "⑫ DB 설계 SSOT" },
      {
        rel: "config/schema/org-hierarchy.md",
        label: "조직 · 자산 계층",
      },
      {
        rel: "config/schema/documentdb/collection-contract.md",
        label: "DocDB 컬렉션 계약",
      },
      {
        rel: "config/schema/documentdb/document-schema-anchors.md",
        label: "DocDB schema anchors",
      },
      { rel: "config/schema/postgres/README.md", label: "Postgres DDL README" },
      { rel: "__generated/postgres-table-inventory.md", label: "Postgres 테이블 인벤토리" },
      { rel: "config/schema/iceberg/README.md", label: "Iceberg · S3 · Firehose" },
    ],
  },
  {
    group: "deploy",
    title: "저장소 · 배포",
    files: [
      { rel: "07-repo-and-deployment.md", label: "⑦ Repo · CI/CD" },
      { rel: "16-local-e2e-testing.md", label: "⑯ 로컬 E2E · Podman" },
      { rel: "11-config-examples-reference.md", label: "⑪ config 샘플 레퍼런스" },
      { rel: "config/README.md", label: "config/ SSOT 인덱스" },
      { rel: "config/local/README.md", label: "로컬 Podman compose" },
      { rel: "config/samples/s3-object-layout.example.md", label: "S3 객체 레이아웃 예시" },
    ],
  },
];

function slugFromRel(rel) {
  return rel
    .replace(/^__generated\//, "gen-")
    .replace(/\.md$/i, "")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()
    .replace(/-+/g, "-");
}

function readArch(rel) {
  const p = join(ARCH_ROOT, rel);
  if (!existsSync(p)) throw new Error(`Missing: ${p}`);
  return readFileSync(p, "utf8");
}

function generatePostgresInventory() {
  const dir = join(ARCH_ROOT, "config/schema/postgres");
  const sqlFiles = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const lines = ["# Postgres 테이블 인벤토리 (DDL SSOT)", ""];
  for (const file of sqlFiles) {
    const text = readFileSync(join(dir, file), "utf8");
    const tables = [...text.matchAll(/CREATE TABLE(?: IF NOT EXISTS)?\s+(?:public\.)?"?(\w+)"?/gi)].map(
      (m) => m[1],
    );
    lines.push(`## ${file}`, "");
    if (tables.length === 0) {
      lines.push("_（CREATE TABLE 없음 — seed/참고 SQL）_", "");
    } else {
      lines.push("| # | 테이블 |", "|---|--------|");
      tables.forEach((t, i) => lines.push(`| ${i + 1} | \`${t}\` |`));
      lines.push("");
    }
  }
  lines.push(
    "> 상세 컬럼·FK·인덱스: `02.arch/config/schema/postgres/*.sql` · manifest `06-postgres.yaml`",
  );
  return lines.join("\n");
}

const GENERATED = {
  "__generated/postgres-table-inventory.md": generatePostgresInventory(),
};

/** @type {Map<string, string>} rel → doc id */
const docIdByRel = new Map();
for (const g of MANIFEST) {
  for (const f of g.files) docIdByRel.set(f.rel, slugFromRel(f.rel));
}

function rewriteLinks(html) {
  let out = html;
  for (const [rel, id] of docIdByRel) {
    const base = basename(rel, ".md");
    const patterns = [
      new RegExp(`href="\\.\\.?/[^"]*${base}\\.md(?:#[^"]*)?"`, "g"),
      new RegExp(`href="\\.\\.?/[^"]*${base}\\.md"`, "g"),
      new RegExp(`href="${rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:#[^"]*)?"`, "g"),
    ];
    for (const re of patterns) {
      out = out.replace(re, (m) => {
        const hash = m.includes("#") ? m.slice(m.indexOf("#")) : "";
        return `href="#doc-${id}${hash === "#" ? "" : hash}"`;
      });
    }
  }
  out = out.replace(/href="\.\.\/00\.doc\/architecture\/index\.html"/g, 'href="#"');
  return out;
}

function mermaidBlocks(html) {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => `<div class="mermaid">${code.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")}</div>`,
  );
}

marked.setOptions({ gfm: true, breaks: false });

const navItems = [];
const sections = [];

sections.push(`
<section id="intro" class="doc-section" data-group="overview">
  <h2><span class="step">★</span> 학습 경로 · SSOT 관계</h2>
  <p class="sec-desc">본 페이지는 <code>02.arch/</code> Markdown·config 전체를 웹에서 탐색하기 위한 <b>완전 미러</b>입니다.</p>
  <div class="learn-box">
    <b>권장 순서:</b> ① 개요 → ② 파이프라인 → ③ Storage → ⑤ YAML → ⑥⑫ DB → ⑩ 배포 → ⑦ Greengrass → ⑧ AI
  </div>
  <table>
    <thead><tr><th>자료</th><th>역할</th></tr></thead>
    <tbody>
      <tr><td class="k"><code>02.arch/*.md</code></td><td>아키텍처 서술 SSOT (본 HTML 원본)</td></tr>
      <tr><td class="k"><code>02.arch/config/</code></td><td>YAML·JSON·DDL·샘플 SSOT</td></tr>
      <tr><td class="k"><code>npm run build</code></td><td>Markdown 변경 후 본 HTML 재생성</td></tr>
    </tbody>
  </table>
  <div class="ok-box"><b>갱신:</b> Markdown/config 수정 → <code>npm run build --prefix 00.doc/architecture</code></div>
</section>
`);

for (const group of MANIFEST) {
  for (const file of group.files) {
    const id = slugFromRel(file.rel);
    const md =
      file.rel in GENERATED ? GENERATED[file.rel] : readArch(file.rel);
    let html = marked.parse(md);
    html = rewriteLinks(html);
    html = mermaidBlocks(html);

    const titleMatch = md.match(/^#\s+(.+)$/m);
    const title = file.label || titleMatch?.[1] || file.rel;
    navItems.push({ group: group.group, groupTitle: group.title, id: `doc-${id}`, title });

    sections.push(`
<section id="doc-${id}" class="doc-section md-content" data-group="${group.group}" data-source="${file.rel}">
  <p class="source-tag">SSOT: <code>02.arch/${file.rel}</code></p>
  ${html}
</section>`);
  }
}

sections.push(`
<section id="status" class="doc-section" data-group="deploy">
  <h2><span class="step">✓</span> 구현 상태 (요약)</h2>
  <table>
    <thead><tr><th>항목</th><th>상태</th></tr></thead>
    <tbody>
      <tr><td>02.arch 문서 18개 + config SSOT</td><td><span class="tag tag-done">완료</span></td></tr>
      <tr><td>UI·API·NestJS 설계 (14)</td><td><span class="tag tag-done">완료</span></td></tr>
      <tr><td>AWS Lambda 개발 스펙 (15)</td><td><span class="tag tag-done">완료</span></td></tr>
      <tr><td>converter-rules + rules JSON 13종</td><td><span class="tag tag-done">완료</span></td></tr>
      <tr><td>Postgres/DocDB DDL + bootstrap</td><td><span class="tag tag-done">완료</span></td></tr>
      <tr><td>Lambda 9종 skeleton + pipeline-core</td><td><span class="tag tag-done">골격</span></td></tr>
      <tr><td>Terraform 6모듈 (validate)</td><td><span class="tag tag-done">골격</span></td></tr>
      <tr><td>Lambda DocDB/Aurora/Firehose 실 write</td><td><span class="tag tag-wip">다음</span></td></tr>
      <tr><td>NestJS API (03.source/beckend/)</td><td><span class="tag tag-wip">다음</span></td></tr>
    </tbody>
  </table>
</section>`);

navItems.push({ group: "deploy", groupTitle: "저장소 · 배포", id: "status", title: "구현 상태" });
navItems.unshift({ group: "overview", groupTitle: "개요", id: "intro", title: "★ 학습 경로" });

const navByGroup = new Map();
for (const item of navItems) {
  if (!navByGroup.has(item.group)) {
    navByGroup.set(item.group, { title: item.groupTitle, items: [] });
  }
  navByGroup.get(item.group).items.push(item);
}

const GROUP_ORDER = [
  "overview",
  "pipeline",
  "media",
  "edge",
  "ai",
  "storage",
  "backend",
  "yaml",
  "database",
  "deploy",
];

let sidebar = "";
for (const gk of GROUP_ORDER) {
  const g = navByGroup.get(gk);
  if (!g) continue;
  sidebar += `<div class="nav-group" data-group="${gk}">\n`;
  sidebar += `  <div class="nav-group-title">${g.title}</div>\n`;
  for (const item of g.items) {
    sidebar += `  <a href="#${item.id}">${item.title}</a>\n`;
  }
  sidebar += `</div>\n`;
}

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>테크밸리 IoT — 아키텍처·YAML·DB 설계 가이드 (02.arch 전체)</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>
:root{
  --navy:#0B3D5C;--navy2:#062840;--accent:#1C7293;--accent2:#0e6a8a;
  --sidebar-w:280px;--line:#D9E2E8;--ink:#1c2b33;--muted:#5b6b73;
  --blue-bg:#E6F1FB;--green-bg:#EEF6EE;--amber-bg:#FAEEDA;--purple-bg:#EEE9F8;
  --light:#EEF4F8;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:72px}
body{margin:0;font-family:"Malgun Gothic","맑은 고딕",-apple-system,sans-serif;color:var(--ink);background:#eef1f4;line-height:1.65;font-size:14px}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.cover{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;padding:36px 24px 32px;text-align:center}
.cover h1{font-size:24px;margin:8px 0}
.cover .sub{opacity:.9;margin:0;font-size:14px}
.badges{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}
.badge{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);padding:4px 11px;border-radius:16px;font-size:11px}
.layout{display:flex;max-width:1480px;margin:0 auto;align-items:flex-start}
.sidebar{
  width:var(--sidebar-w);flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;
  background:#fff;border-right:1px solid var(--line);padding:12px 0 40px;
}
.sidebar-head{padding:12px 16px 8px;border-bottom:1px solid var(--line);margin-bottom:8px}
.sidebar-head input{width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:13px}
.nav-group{margin:0 0 4px}
.nav-group-title{font-size:10px;font-weight:700;letter-spacing:.06em;color:var(--muted);padding:10px 16px 4px;text-transform:uppercase}
.nav-group a{display:block;padding:5px 16px 5px 20px;font-size:12px;color:var(--ink);border-left:3px solid transparent;text-decoration:none;line-height:1.35}
.nav-group a:hover{background:var(--light);color:var(--navy)}
.nav-group a.active{border-left-color:var(--accent);background:var(--blue-bg);font-weight:600}
.main{flex:1;min-width:0;padding:0 24px 60px}
.doc-section{background:#fff;border:1px solid var(--line);border-radius:12px;padding:22px 26px;margin-top:18px}
.source-tag{font-size:11px;color:var(--muted);margin:0 0 12px;padding:4px 8px;background:var(--light);border-radius:6px;display:inline-block}
.step{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;background:var(--accent);color:#fff;border-radius:6px;font-size:12px;font-weight:700;margin-right:4px}
.sec-desc{color:var(--muted);font-size:13px;margin:2px 0 14px}
.md-content h1{font-size:20px;color:var(--navy);margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid var(--light)}
.md-content h2{font-size:16px;color:var(--navy);margin:22px 0 8px;padding-left:8px;border-left:3px solid var(--accent)}
.md-content h3{font-size:14px;color:var(--accent2);margin:16px 0 6px}
.md-content h4{font-size:13px;color:var(--navy);margin:12px 0 4px}
.md-content p,.md-content li{font-size:13.5px}
.md-content table{width:100%;border-collapse:collapse;font-size:12.5px;margin:8px 0}
.md-content th,.md-content td{border:1px solid var(--line);padding:7px 9px;text-align:left;vertical-align:top}
.md-content thead th{background:var(--navy);color:#fff;font-weight:600;text-align:center;font-size:12px}
.md-content tbody td:first-child{font-weight:600;background:var(--light)}
.md-content code{background:#f1f5f8;border:1px solid #e2eaf0;border-radius:4px;padding:1px 5px;font-family:Consolas,monospace;font-size:11.5px}
.md-content pre{background:#0e2233;color:#cfe3f2;padding:12px 14px;border-radius:8px;overflow-x:auto;font-size:11.5px;line-height:1.5;margin:8px 0}
.md-content pre code{background:transparent;border:none;padding:0;color:inherit}
.md-content blockquote{margin:8px 0;padding:8px 14px;border-left:4px solid var(--accent);background:var(--blue-bg);font-size:13px}
.md-content ul,.md-content ol{padding-left:22px;margin:6px 0}
.learn-box,.warn-box,.ok-box,.purple-box{border-radius:10px;padding:12px 16px;margin:10px 0;font-size:13px}
.learn-box{background:var(--blue-bg);border:1px solid #b8d4ef}
.ok-box{background:var(--green-bg);border:1px solid #a8c896}
.mermaid{margin:10px 0;background:#fafcfd;border-radius:8px;padding:10px;font-size:12px}
.tag{display:inline-block;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:600}
.tag-done{background:#d4edda;color:#155724}
.tag-wip{background:#fff3cd;color:#856404}
footer{text-align:center;color:var(--muted);font-size:11px;margin:28px 0 12px}
@media(max-width:960px){.layout{flex-direction:column}.sidebar{width:100%;height:auto;position:relative;border-right:none;border-bottom:1px solid var(--line)}.main{padding:0 14px 40px}}
@media print{.sidebar{display:none}.main{padding:0}}
.hidden{display:none!important}
</style>
</head>
<body>

<header class="cover">
  <p style="letter-spacing:2px;font-size:11px;opacity:.8;margin:0">TECHVALLEY IoT · 02.arch FULL MIRROR</p>
  <h1>테크밸리 IoT — 아키텍처·YAML·DB 설계 가이드</h1>
  <p class="sub">02.arch Markdown 12종 + config/schema + Postgres 테이블 인벤토리 · MOBI yaml-design 탐색 패턴</p>
  <div class="badges">
    <span class="badge">tenant tv</span>
    <span class="badge">device_code = S/N</span>
    <span class="badge">YAML 4층 + predeploy</span>
    <span class="badge">DocDB · Postgres · Iceberg</span>
    <span class="badge">generated ${new Date().toISOString().slice(0, 10)}</span>
  </div>
</header>

<div class="layout">
<aside class="sidebar" id="sidebar">
  <div class="sidebar-head">
    <strong style="font-size:13px;color:var(--navy)">목차 (${navItems.length} 섹션)</strong>
    <input type="search" id="navSearch" placeholder="섹션 검색…" autocomplete="off">
  </div>
${sidebar}
</aside>

<main id="main">
${sections.join("\n")}
<footer>
  테크밸리 IoT · SSOT <code>02.arch/</code> ·
  재생성: <code>npm run build --prefix 00.doc/architecture</code>
</footer>
</main>
</div>

<script>
mermaid.initialize({startOnLoad:true,theme:'neutral',securityLevel:'loose'});
(function(){
  const search = document.getElementById('navSearch');
  const links = document.querySelectorAll('.sidebar a[href^="#"]');
  const sections = [...links].map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('.nav-group').forEach(g => {
      let any = false;
      g.querySelectorAll('a').forEach(a => {
        const show = !q || a.textContent.toLowerCase().includes(q);
        a.classList.toggle('hidden', !show);
        if (show) any = true;
      });
      g.classList.toggle('hidden', !any);
    });
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, {rootMargin:'-25% 0px -55% 0px', threshold:0});
  sections.forEach(s => obs.observe(s));
})();
</script>
</body>
</html>`;

writeFileSync(OUT, html, "utf8");
console.log(`Wrote ${OUT} (${sections.length} sections, ${relative(join(__dirname, "../.."), ARCH_ROOT)} mirror)`);
