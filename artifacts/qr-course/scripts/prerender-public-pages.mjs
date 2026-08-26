import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const artifactDir = path.resolve(here, "..");
const publicDir = path.join(artifactDir, "dist", "public");
const siteUrl = "https://promptengineering.ink";

const weekMeta = {
  1: {
    title: "Foundations: how models respond to prompts",
    summary:
      "What a prompt is, how language models read and continue text, and the core anatomy of a clear, effective instruction.",
  },
  2: {
    title: "Core techniques",
    summary:
      "The workhorse methods that raise output quality: examples, reasoning, decomposition, context, structure, and prompt debugging.",
  },
  3: {
    title: "Advanced patterns and reliability",
    summary:
      "How to get consistent, structured, grounded outputs with schemas, chains, retrieval, tool use, and evaluation.",
  },
  4: {
    title: "Applications, safety, and building systems",
    summary:
      "Applying prompting to real work while guarding against injection, hallucination, bias, and unreliable AI features.",
  },
};

function decodeString(expression) {
  const value = expression.trim();
  if (value.startsWith("`") && value.endsWith("`")) {
    return value.slice(1, -1);
  }
  return JSON.parse(value);
}

function readTopics() {
  const topics = [];
  for (let week = 1; week <= 4; week += 1) {
    const sourcePath = path.resolve(
      artifactDir,
      "..",
      "api-server",
      "src",
      "lib",
      "content",
      `week${week}.ts`,
    );
    const source = fs.readFileSync(sourcePath, "utf8");
    const topicPattern =
      /\{\s*slug:\s*"[^"]+",\s*title:\s*"([^"]+)",\s*weekNumber:\s*(\d+),\s*blurb:\s*([\s\S]*?),\s*lectureTitle:\s*"([^"]+)",\s*body:\s*`([\s\S]*?)`,\s*\},/g;
    for (const match of source.matchAll(topicPattern)) {
      topics.push({
        weekNumber: Number(match[2]),
        blurb: decodeString(match[3]),
        title: match[4],
        body: match[5],
      });
    }
  }

  if (topics.length !== 28) {
    throw new Error(
      `Expected 28 public curriculum topics, found ${topics.length}. Update the prerender parser with the content shape.`,
    );
  }
  return topics.map((topic, index) => ({ ...topic, id: index + 1 }));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineMarkdown(value) {
  return value
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let paragraph = [];
  let list = false;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function closeList() {
    if (!list) return;
    output.push("</ul>");
    list = false;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = Math.max(2, heading[1].length);
      output.push(
        `<h${level}>${inlineMarkdown(escapeHtml(heading[2]))}</h${level}>`,
      );
      continue;
    }

    const bullet = line.match(/^[-*+]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!list) {
        output.push("<ul>");
        list = true;
      }
      output.push(`<li>${inlineMarkdown(escapeHtml(bullet[1]))}</li>`);
      continue;
    }

    closeList();
    paragraph.push(escapeHtml(line));
  }

  flushParagraph();
  closeList();
  return output.join("\n");
}

function replaceTag(html, pattern, replacement) {
  if (!pattern.test(html)) {
    throw new Error(`Could not find expected HTML tag: ${pattern}`);
  }
  return html.replace(pattern, replacement);
}

function pageHtml(template, { title, description, url, content, schema }) {
  let html = template;
  html = html.replace(
    /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    "",
  );
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceTag(
    html,
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  html = replaceTag(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  );
  html = replaceTag(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${url}" />`,
  );
  html = replaceTag(
    html,
    /<meta name="twitter:title" content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
  );
  html = replaceTag(
    html,
    /<meta name="twitter:description" content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`,
  );
  return html.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`,
  );
}

function noindexHtml(template) {
  let html = template;
  html = replaceTag(
    html,
    /<meta name="robots" content="[^"]*"\s*\/>/,
    '<meta name="robots" content="noindex,follow" />',
  );
  html = html.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/>/, "");
  return html.replace(
    /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    "",
  );
}

function writeRoute(relativePath, html) {
  const target = path.join(publicDir, relativePath, "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
}

const template = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
const topics = readTopics();
const weeks = new Map();
for (const topic of topics) {
  const current = weeks.get(topic.weekNumber) ?? [];
  current.push(topic);
  weeks.set(topic.weekNumber, current);
}

for (const [weekNumber, weekTopics] of weeks) {
  const meta = weekMeta[weekNumber];
  const url = `${siteUrl}/weeks/${weekNumber}`;
  const title = `Week ${weekNumber}: ${meta.title} | Prompt Engineering`;
  const description = `${meta.summary} Explore ${weekTopics.length} practical prompt engineering lessons in this free online course.`;
  const content = `
    <main>
      <article>
        <p>Prompt Engineering course · Week ${weekNumber}</p>
        <h1>${escapeHtml(meta.title)}</h1>
        <p>${escapeHtml(meta.summary)}</p>
        <h2>Lessons in this week</h2>
        <ul>
          ${weekTopics
            .map(
              (topic) =>
                `<li><a href="/lectures/${topic.id}">${escapeHtml(topic.title)}</a> — ${escapeHtml(topic.blurb)}</li>`,
            )
            .join("\n")}
        </ul>
      </article>
    </main>`;
  writeRoute(
    `weeks/${weekNumber}`,
    pageHtml(template, {
      title,
      description,
      url,
      content,
      schema: {
        "@context": "https://schema.org",
        "@type": "Course",
        name: `Prompt Engineering — Week ${weekNumber}`,
        description,
        url,
        isAccessibleForFree: true,
        inLanguage: "en",
        provider: { "@type": "Organization", name: "Prompt Engineering", url: siteUrl },
      },
    }),
  );
}

for (const topic of topics) {
  const url = `${siteUrl}/lectures/${topic.id}`;
  const title = `${topic.title} | Prompt Engineering Course`;
  const description = `${topic.blurb} Read this practical lesson in the free Prompt Engineering course.`;
  const content = `
    <main>
      <article>
        <p><a href="/weeks/${topic.weekNumber}">Prompt Engineering · Week ${topic.weekNumber}</a></p>
        <h1>${escapeHtml(topic.title)}</h1>
        ${markdownToHtml(topic.body)}
      </article>
    </main>`;
  writeRoute(
    `lectures/${topic.id}`,
    pageHtml(template, {
      title,
      description,
      url,
      content,
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: topic.title,
        description,
        url,
        isPartOf: { "@type": "Course", name: "Prompt Engineering", url: siteUrl },
        author: { "@type": "Organization", name: "Prompt Engineering" },
        inLanguage: "en",
      },
    }),
  );
}

fs.writeFileSync(
  path.join(publicDir, "noindex.html"),
  noindexHtml(template),
);

fs.writeFileSync(
  path.join(publicDir, "404.html"),
  `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Page not found | Prompt Engineering</title></head><body><main><h1>Page not found</h1><p>The page you requested does not exist.</p><p><a href="/">Return to Prompt Engineering</a></p></main></body></html>`,
);

console.log(`Prerendered ${topics.length} public lecture pages and ${weeks.size} week pages.`);