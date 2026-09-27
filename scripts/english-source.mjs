import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatedFallbackPaths, writeEnglishFallbacks } from "./english-fallbacks.mjs";
import { LANGUAGE_OPTIONS } from "../src/i18n/site-copy.mjs";

const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE_DOCS = path.join(REPO_ROOT, "content-source/en-US");
const GENERATED_DOCS = path.join(REPO_ROOT, "src/content/docs/en-US");
const GENERATED_ASSETS = path.join(REPO_ROOT, "public/en-US/assets");
const BASELINES_FILE = path.join(REPO_ROOT, "src/content/translation-baselines.json");

function posixPath(value) {
  return value.split(path.sep).join("/");
}

function encodePath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function decodeTitle(value, file) {
  const title = value.trim();
  if (title.startsWith('"')) {
    try {
      return JSON.parse(title);
    } catch {
      throw new Error(`Invalid quoted title in ${file}`);
    }
  }
  if (title.startsWith("'") && title.endsWith("'")) {
    return title.slice(1, -1).replaceAll("''", "'");
  }
  if (/[:#\[\]{}]/u.test(title)) {
    throw new Error(`Unsupported YAML title syntax in ${file}; quote the title`);
  }
  return title;
}

function decodeDescription(value, file) {
  const description = value.trim();
  if (description.startsWith('"') || description.startsWith("'")) return decodeTitle(description, file);
  return description;
}

function parseFrontmatter(source, file) {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) {
    return { title: undefined, description: undefined, body: source };
  }

  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/u);
  if (!match) {
    throw new Error(`Unterminated frontmatter in ${file}`);
  }

  let title;
  let description;
  for (const line of match[1].split(/\r?\n/u)) {
    if (!line.trim()) continue;
    const field = line.match(/^(title|description):\s*(.*?)\s*$/u);
    if (!field) {
      throw new Error(`Unsupported frontmatter in ${file}: ${line}`);
    }
    const value = field[1] === "title"
      ? decodeTitle(field[2], file)
      : decodeDescription(field[2], file);
    if (!value) throw new Error(`Empty ${field[1]} in ${file}`);
    if (field[1] === "title") title = value;
    else description = value;
  }

  return { title, description, body: source.slice(match[0].length) };
}

function removeCodeFences(source) {
  return source.replace(/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?\n\2[ \t]*(?=\n|$)/gu, "$1");
}

function assertSupportedMarkdown(source, file) {
  const prose = removeCodeFences(source);
  if (/^\s*(?:import|export)\s.+$/mu.test(prose)) {
    throw new Error(`MDX imports/exports are not supported in ${file}; use Markdown only`);
  }
  if (/<[A-Z][A-Za-z0-9.]*(?:\s|\/?>)/u.test(prose)) {
    throw new Error(`MDX components are not supported in ${file}; use standard Markdown`);
  }
}

async function walkMarkdown(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...await walkMarkdown(absolute));
    } else if (entry.isFile() && /\.mdx?$/iu.test(entry.name)) {
      if (!/\.md$/u.test(entry.name)) {
        throw new Error(`Unsupported source file ${absolute}; only .md pages can be imported`);
      }
      found.push(absolute);
    }
  }
  return found.sort();
}

function outputRelativePath(sourceRelativePath) {
  const segments = sourceRelativePath.split("/");
  const filename = segments.pop();
  const stem = filename.replace(/\.md$/u, "");
  segments.push(stem.toLowerCase() === "readme" ? "index.md" : `${stem}.md`);
  return segments.join("/");
}

function pageRoute(sourceRelativePath) {
  const output = outputRelativePath(sourceRelativePath).replace(/\.md$/u, "");
  return output === "index" || output.endsWith("/index")
    ? output.replace(/(?:^|\/)index$/u, "")
    : output;
}

function splitTarget(target) {
  const match = target.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/u);
  return { pathname: match?.[1] ?? target, suffix: `${match?.[2] ?? ""}${match?.[3] ?? ""}` };
}

function isExternalTarget(target) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/iu.test(target);
}

async function replaceMarkdownTargets(body, transform) {
  const protectedSegments = [];
  let result = body.replace(/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?\n\2[ \t]*(?=\n|$)/gu, (whole) => {
    const token = `OMNIROUTE_CODE_BLOCK_${protectedSegments.length}_TOKEN`;
    protectedSegments.push(whole);
    return token;
  });
  result = result.replace(/(`+)(?!`)([\s\S]*?[^`])\1(?!`)/gu, (whole) => {
    const token = `OMNIROUTE_INLINE_CODE_${protectedSegments.length}_TOKEN`;
    protectedSegments.push(whole);
    return token;
  });

  const replacements = [];
  const patterns = [
    { regex: /(!?\[[^\]]*\]\()(<[^>]+>|[^\s)]+)(\s+(?:"[^"]*"|'[^']*'))?(\))/gu, group: 2 },
    { regex: /^(\s*\[[^\]]+\]:\s*)(<?)(\S+?)(>?)(\s+(?:"[^"]*"|'[^']*'))?\s*$/gmu, group: 3 },
    { regex: /\b(src|href)=(["'])([^"']+)\2/giu, group: 3 },
  ];
  for (const { regex, group } of patterns) {
    for (const match of result.matchAll(regex)) {
      const whole = match[0];
      const target = match[group];
      const offset = match.index + match[0].indexOf(target);
      const value = target.startsWith("<") && target.endsWith(">")
        ? `<${await transform(target.slice(1, -1), whole)}>`
        : await transform(target, whole);
      replacements.push({ start: offset, end: offset + target.length, value });
    }
  }
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    result = `${result.slice(0, replacement.start)}${replacement.value}${result.slice(replacement.end)}`;
  }
  return result.replace(/OMNIROUTE_(?:CODE_BLOCK|INLINE_CODE)_(\d+)_TOKEN/gu, (token, index) =>
    protectedSegments[Number(index)] ?? token);
}

async function readSourceFiles(sourceDir) {
  try {
    const sourceStat = await stat(sourceDir);
    if (!sourceStat.isDirectory()) throw new Error("not a directory");
  } catch {
    throw new Error(
      `English source is missing at ${sourceDir}. Restore content-source/en-US from version control`,
    );
  }

  const files = await walkMarkdown(sourceDir);
  if (!files.includes(path.join(sourceDir, "README.md"))) {
    throw new Error(`Required English home page is missing: ${path.join(sourceDir, "README.md")}`);
  }
  return files;
}

export async function createImportPlan({
  sourceDir: requestedSourceDir = SOURCE_DOCS,
  revision = "site-owned",
} = {}) {
  const sourceDir = path.resolve(requestedSourceDir);
  const sourceFiles = await readSourceFiles(sourceDir);
  const sourceSet = new Set(sourceFiles);
  const documents = new Map();
  const outputs = new Map();
  const assets = new Map();
  const pending = [];

  for (const absolute of sourceFiles) {
    const relative = posixPath(path.relative(sourceDir, absolute));
    const output = outputRelativePath(relative);
    const outputKey = output.toLowerCase();
    if (outputs.has(outputKey)) {
      throw new Error(`English source path collision: ${relative} and ${outputs.get(outputKey)} both map to ${output}`);
    }
    outputs.set(outputKey, relative);

    const original = await readFile(absolute, "utf8");
    assertSupportedMarkdown(original, relative);
    const parsed = parseFrontmatter(original, relative);
    let title = parsed.title;
    let body = parsed.body.replace(/\r\n?/gu, "\n");
    const firstContentLine = body.split("\n").find((line) => line.trim());
    if (!title) {
      const heading = firstContentLine?.match(/^#\s+(.+?)\s*#*\s*$/u);
      if (!heading) {
        throw new Error(`Missing frontmatter title or leading H1 in ${relative}`);
      }
      title = heading[1].trim();
    }
    if (!title.trim()) throw new Error(`Empty title in ${relative}`);
    if (firstContentLine?.match(/^#\s+(.+?)\s*#*\s*$/u)?.[1]?.trim() === title.trim()) {
      body = body.replace(/^\s*#\s+.+?\s*#*\s*(?:\n|$)/u, "");
    }

    const metadata = [
      `title: ${JSON.stringify(title)}`,
      ...(parsed.description ? [`description: ${JSON.stringify(parsed.description)}`] : []),
    ];
    documents.set(relative, {
      output,
      source: original,
      sha256: hash(original),
      rendered: `---\n${metadata.join("\n")}\n---\n\n${body.trimStart()}`,
    });
    pending.push({ absolute, relative, output });
  }

  async function resolveTarget(target, sourceRelative) {
    if (!target || target.startsWith("#") || isExternalTarget(target)) return target;
    const { pathname, suffix } = splitTarget(target);
    if (!pathname) return target;

    let decoded;
    try {
      decoded = decodeURIComponent(pathname);
    } catch {
      throw new Error(`Invalid encoded link ${target} in ${sourceRelative}`);
    }
    const resolved = path.resolve(sourceDir, path.dirname(sourceRelative), decoded);
    const insideDocs = resolved === sourceDir || resolved.startsWith(`${sourceDir}${path.sep}`);

    if (/\.md$/iu.test(decoded)) {
      if (insideDocs && sourceSet.has(resolved)) {
        const route = pageRoute(posixPath(path.relative(sourceDir, resolved)));
        return `/en-US/${route ? `${encodePath(route)}/` : ""}${suffix}`;
      }
      throw new Error(`Broken or unsupported Markdown link ${target} in ${sourceRelative}`);
    }

    if (!insideDocs) {
      throw new Error(`Referenced asset is outside English source: ${target} in ${sourceRelative}`);
    }
    try {
      const assetStat = await stat(resolved);
      if (!assetStat.isFile()) throw new Error("not a file");
    } catch {
      throw new Error(`Missing local asset ${target} referenced by ${sourceRelative}`);
    }
    const assetRelative = posixPath(path.relative(sourceDir, resolved));
    const assetKey = assetRelative.toLowerCase();
    if (assets.has(assetKey) && assets.get(assetKey).source !== resolved) {
      throw new Error(`English asset path collision: ${assetRelative}`);
    }
    if (!assets.has(assetKey)) assets.set(assetKey, { source: resolved, relative: assetRelative });
    return `/en-US/assets/${encodePath(assetRelative)}${suffix}`;
  }

  const plan = [];
  for (const item of pending) {
    const document = documents.get(item.relative);
    const body = document.rendered.slice(document.rendered.indexOf("\n\n") + 2);
    const rewritten = await replaceMarkdownTargets(body, (target) => resolveTarget(target, item.relative));
    const rendered = `${document.rendered.slice(0, document.rendered.indexOf("\n\n") + 2)}${rewritten}`;
    plan.push({ ...item, rendered });
  }

  for (const [relative, document] of documents) {
    document.rendered = plan.find((item) => item.relative === relative).rendered;
  }

  return {
    revision,
    documents,
    assets,
  };
}

export async function writeImportPlan(plan, {
  outputDir = GENERATED_DOCS,
  assetsDir = GENERATED_ASSETS,
  locales,
} = {}) {
  await rm(outputDir, { recursive: true, force: true });
  await rm(assetsDir, { recursive: true, force: true });
  for (const { output, rendered } of plan.documents.values()) {
    const destination = path.join(outputDir, ...output.split("/"));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, rendered, "utf8");
  }
  for (const { source, relative } of plan.assets.values()) {
    const destination = path.join(assetsDir, ...relative.split("/"));
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
  await writeEnglishFallbacks(plan, { contentRoot: path.dirname(outputDir), locales });
}

export async function importEnglishDocs(options = {}) {
  let plan;
  try {
    plan = await createImportPlan(options);
  } catch (error) {
    const outputDir = options.outputDir ?? GENERATED_DOCS;
    await rm(outputDir, { recursive: true, force: true });
    await rm(options.assetsDir ?? GENERATED_ASSETS, { recursive: true, force: true });
    await writeEnglishFallbacks({ documents: new Map() }, {
      contentRoot: path.dirname(outputDir),
      locales: options.locales,
    });
    throw error;
  }
  await writeImportPlan(plan, options);
  return plan;
}

function contentTopic(relative) {
  const topic = posixPath(relative).replace(/\.(?:md|mdx)$/u, "");
  return topic === "index" || topic.endsWith("/index")
    ? topic.replace(/(?:^|\/)index$/u, "")
    : topic;
}

async function listContentPages(contentRoot, directory = contentRoot) {
  const pages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...await listContentPages(contentRoot, absolute));
    else if (entry.isFile() && /\.(?:md|mdx)$/u.test(entry.name)) pages.push(absolute);
  }
  return pages;
}

export async function checkTranslationBaselines({
  sourceDir: requestedSourceDir = SOURCE_DOCS,
  contentRoot = path.join(REPO_ROOT, "src/content/docs"),
  manifestPath = BASELINES_FILE,
  revision = "site-owned",
} = {}) {
  const sourceDir = path.resolve(requestedSourceDir);
  const files = await readSourceFiles(sourceDir);
  const sourceByTopic = new Map();
  for (const absolute of files) {
    const relative = posixPath(path.relative(sourceDir, absolute));
    const topic = pageRoute(relative);
    sourceByTopic.set(topic, {
      source: relative,
      sha256: hash(await readFile(absolute)),
    });
  }

  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read translation baseline manifest ${manifestPath}: ${error.message}`);
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error(`Translation baseline manifest must be an object: ${manifestPath}`);
  }

  const messages = [];
  const pages = await listContentPages(contentRoot);
  const generatedPages = await generatedFallbackPaths(contentRoot);
  const translatedTopics = new Set();
  for (const page of pages) {
    const relative = posixPath(path.relative(contentRoot, page));
    if (generatedPages.has(relative)) continue;
    const segments = relative.split("/");
    if (segments[0] === "en-US") continue;
    let locale = "zh-CN";
    let topicPath = relative;
    if (LANGUAGE_OPTIONS.some(({ code }) => code === segments[0]) && segments.length > 1) {
      [locale] = segments;
      topicPath = segments.slice(1).join("/");
    }
    const topic = contentTopic(topicPath);
    if (!topic) continue;
    translatedTopics.add(`${locale}/${topic}`);
    if (!sourceByTopic.has(topic)) {
      messages.push(`${locale}/${topic}: English source is missing`);
      continue;
    }
    if (!manifest[locale]?.[topic]) {
      messages.push(`${locale}/${topic}: translation has no reviewed English source baseline`);
    }
  }

  for (const [locale, topics] of Object.entries(manifest)) {
    if (!topics || typeof topics !== "object" || Array.isArray(topics)) {
      messages.push(`${locale}: expected a topic-to-baseline object`);
      continue;
    }
    for (const [topic, baseline] of Object.entries(topics)) {
      const source = sourceByTopic.get(topic);
      if (!source) {
        messages.push(`${locale}/${topic}: English source was removed`);
        continue;
      }
      if (baseline?.source !== source.source) {
        messages.push(`${locale}/${topic}: source identity changed (${baseline?.source ?? "missing"} -> ${source.source})`);
      } else if (baseline?.sha256 !== source.sha256) {
        messages.push(`${locale}/${topic}: English source changed; review the translation`);
      }
      if (!baseline?.sha256 || !baseline?.source || !baseline?.revision) {
        messages.push(`${locale}/${topic}: baseline requires source, sha256, and revision`);
      }
      if (!translatedTopics.has(`${locale}/${topic}`)) {
        messages.push(`${locale}/${topic}: translation page is missing`);
      }
    }
  }

  if (messages.length) {
    throw new Error(`Translation baseline review required:\n${messages.map((message) => `- ${message}`).join("\n")}`);
  }
  return { revision, checkedTranslations: Object.values(manifest).reduce((count, topics) => count + Object.keys(topics).length, 0) };
}
