// Generates the profile README's SVG assets in light and dark variants.
// Run: node scripts/build.mjs  (no dependencies)

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");

const THEMES = {
  light: {
    text: "#1f2328",
    muted: "#59636e",
    faint: "#818b98",
    border: "#d1d9e0",
    accent: "#1a7f37",
  },
  dark: {
    text: "#f0f6fc",
    muted: "#9198a1",
    faint: "#656c76",
    border: "#3d444d",
    accent: "#3fb950",
  },
};

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";
const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, maxChars) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const svg = (w, h, title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
${body}
</svg>
`;

// ---------------------------------------------------------------- header

function header(t) {
  const W = 880;
  const H = 262;
  const x0 = 36;
  const cw = 9.2; // monospace advance at 15px, used to place each character
  const prompt = "~ $ ";
  const command = "whoami";
  const typeStart = 0.5;
  const typeStep = 0.11;
  const enterAt = typeStart + command.length * typeStep + 0.35;
  const outAt = enterAt + 0.15;

  const char = (c, i, y, fill, begin) => {
    const x = (x0 + i * cw).toFixed(1);
    // Visible by default; the animation hides it until its turn. Renderers
    // without SVG animation show the finished header instead of a blank one.
    const anim =
      begin === undefined
        ? ""
        : `<animate attributeName="opacity" values="0;1" keyTimes="0;1" calcMode="discrete" dur="${begin.toFixed(2)}s" fill="freeze"/>`;
    return `<text x="${x}" y="${y}" fill="${fill}">${esc(c)}${anim}</text>`;
  };

  const line1 = [
    ...[...prompt].map((c, i) =>
      char(c, i, 52, c === "$" ? t.accent : t.faint),
    ),
    ...[...command].map((c, i) =>
      char(c, prompt.length + i, 52, t.text, typeStart + i * typeStep),
    ),
  ].join("\n");

  // Cursor on the command line: follows the typing, then disappears on "enter".
  const cursorXs = [...Array(command.length + 1)].map((_, i) =>
    (x0 + (prompt.length + i) * cw).toFixed(1),
  );
  const cursorTimes = [0, ...[...command].map((_, i) => typeStart + i * typeStep + 0.01)];
  const keyTimes = cursorTimes.map((s) => (s / enterAt).toFixed(4)).join(";");
  const cursor1 = `<rect x="${cursorXs[0]}" y="39" width="${cw}" height="17" fill="${t.muted}" opacity="0">
<animate attributeName="x" values="${cursorXs.join(";")}" keyTimes="${keyTimes}" dur="${enterAt.toFixed(2)}s" calcMode="discrete" fill="freeze"/>
<animate attributeName="opacity" values="1;0" keyTimes="0;1" calcMode="discrete" dur="${enterAt.toFixed(2)}s" fill="freeze"/>
</rect>`;

  const reveal = (delay) => {
    const start = outAt + delay;
    const dur = start + 0.45;
    return `><animate attributeName="opacity" values="0;0;1" keyTimes="0;${(start / dur).toFixed(4)};1" dur="${dur.toFixed(2)}s" fill="freeze"/>`;
  };

  const output = `
<g ${reveal(0)}
<text x="${x0}" y="112" font-family="${SANS}" font-size="46" font-weight="600" letter-spacing="-1" fill="${t.text}">Arda Ulas Ozdemir</text>
</g>
<g ${reveal(0.15)}
<text x="${x0}" y="150" font-family="${SANS}" font-size="19" fill="${t.muted}">Software developer. Android, on-device AI, and tools for debugging AI agents.</text>
</g>
<g ${reveal(0.3)}
<line x1="${x0}" y1="178" x2="${W - x0}" y2="178" stroke="${t.border}"/>
<text x="${x0}" y="206" font-family="${MONO}" font-size="13" fill="${t.faint}">Toronto, ON  ·  Queen's Computing '26  ·  previously Android HMI at Ford</text>
</g>`;

  // Second prompt: types `ls projects/`, which leads into the project grid below.
  const finalAt = outAt + 0.9;
  const command2 = "ls projects/";
  const type2Start = finalAt + 0.6;
  const type2End = type2Start + command2.length * typeStep;
  const line2 = [
    ...[...prompt].map((c, i) =>
      char(c, i, 240, c === "$" ? t.accent : t.faint, finalAt),
    ),
    ...[...command2].map((c, i) =>
      char(c, prompt.length + i, 240, t.text, type2Start + i * typeStep),
    ),
  ].join("\n");
  const cursor2Xs = [...Array(command2.length + 1)].map((_, i) =>
    (x0 + (prompt.length + i) * cw).toFixed(1),
  );
  const cursor2Times = [0, ...[...command2].map((_, i) => type2Start - finalAt + i * typeStep + 0.01)];
  const type2Dur = type2End - finalAt;
  const cursor2 = `<rect x="${cursor2Xs[0]}" y="227" width="${cw}" height="17" fill="${t.muted}" opacity="0">
<animate attributeName="x" values="${cursor2Xs.join(";")}" keyTimes="${cursor2Times.map((s) => (s / type2Dur).toFixed(4)).join(";")}" begin="${finalAt.toFixed(2)}s" dur="${type2Dur.toFixed(2)}s" calcMode="discrete" fill="freeze"/>
<animate attributeName="opacity" values="0;1" keyTimes="0;1" calcMode="discrete" dur="${finalAt.toFixed(2)}s" fill="freeze"/>
<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" begin="${(type2End + 0.2).toFixed(2)}s" repeatCount="indefinite"/>
</rect>`;

  return svg(
    W,
    H,
    "$ whoami: Arda Ulas Ozdemir. Software developer. Android, on-device AI, and tools for debugging AI agents. $ ls projects/",
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${t.border}"/>
<g font-family="${MONO}" font-size="15">
${line1}
${cursor1}
${line2}
${cursor2}
</g>
${output}`,
  );
}

// ---------------------------------------------------------------- cards

const PROJECTS = [
  {
    slug: "earshot",
    name: "Earshot",
    kind: "Android · on-device AI",
    tag: "v0.2.1",
    stack: "Kotlin · Compose · whisper.cpp · llama.cpp",
    desc: "Offline push-to-talk voice control for a car's cabin climate. On-device speech and a small language model, with a safety policy between the models and the vehicle.",
  },
  {
    slug: "blackbox",
    name: "Blackbox",
    kind: "Developer tools",
    tag: "npm · v0.2.1",
    stack: "TypeScript · Node.js · Vitest",
    desc: "Time-travel debugger for AI agents. Record an Anthropic or OpenAI agent run, replay it offline, fork it at any tool result, and diff to the first divergence.",
  },
  {
    slug: "marque",
    name: "Marque",
    kind: "Android",
    tag: "v1.0.0",
    stack: "Kotlin · Compose · Hilt · Room",
    desc: "Offline-first Android app for browsing car makes and models from the NHTSA vPIC public API, with a Room cache and type-safe Compose navigation.",
  },
  {
    slug: "slawatch",
    name: "slawatch",
    kind: "Data · ML",
    tag: "",
    stack: "Python · pandas · scikit-learn · AWS",
    desc: "SLA-breach risk analytics on synthetic service-desk tickets: a PostgreSQL pipeline, a scikit-learn model behind FastAPI on AWS Lambda, and a Tableau dashboard.",
  },
  {
    slug: "fieldcheck",
    name: "FieldCheck",
    kind: "Backend · .NET",
    tag: "",
    stack: "C# · .NET 10 · SQL Server · Azure",
    desc: "Equipment-inspection tracking API: EF Core on SQL Server, T-SQL procedures and views, OData queries, and inspection photos in Azure Blob Storage.",
  },
  {
    slug: "after-hours",
    name: "After Hours",
    kind: "Just for fun",
    tag: "play in browser",
    stack: "HTML · pixel art",
    desc: "A cozy pixel-art Pomodoro focus companion. Work alongside a late-night Tokyo radio-repair grandmother.",
  },
];

function card(p, index, t) {
  const W = 440;
  const H = 232;
  const x = 24;
  const n = String(index + 1).padStart(2, "0");
  const lines = wrap(p.desc, 52)
    .map(
      (l, i) =>
        `<text x="${x}" y="${106 + i * 21}" font-family="${SANS}" font-size="14" fill="${t.muted}">${esc(l)}</text>`,
    )
    .join("\n");

  return svg(
    W,
    H,
    `${p.name}: ${p.desc}`,
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${t.border}"/>
<text x="${x}" y="40" font-family="${MONO}" font-size="12" fill="${t.faint}"><tspan fill="${t.accent}">${n}</tspan>  ${esc(p.kind)}</text>
<text x="${W - x}" y="40" text-anchor="end" font-family="${SANS}" font-size="16" fill="${t.faint}">↗</text>
<text x="${x}" y="76" font-family="${SANS}" font-size="22" font-weight="600" fill="${t.text}">${esc(p.name)}</text>
${lines}
<text x="${x}" y="${H - 22}" font-family="${MONO}" font-size="12" fill="${t.faint}">${esc(p.stack)}</text>
${p.tag ? `<text x="${W - x}" y="${H - 22}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.faint}">${esc(p.tag)}</text>` : ""}`,
  );
}

// ---------------------------------------------------------------- write

mkdirSync(OUT, { recursive: true });
for (const [mode, t] of Object.entries(THEMES)) {
  writeFileSync(join(OUT, `header-${mode}.svg`), header(t));
  PROJECTS.forEach((p, i) =>
    writeFileSync(join(OUT, `card-${p.slug}-${mode}.svg`), card(p, i, t)),
  );
}
console.log(`wrote ${2 + PROJECTS.length * 2} files to assets/`);
