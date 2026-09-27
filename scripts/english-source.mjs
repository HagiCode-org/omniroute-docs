import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGE_OPTIONS, SITE_COPY } from "../src/i18n/site-copy.mjs";
import { discoverTopics, translatedSource } from "./upstream-topics.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE = path.join(ROOT, "vendor/OmniRoute");
const CONTENT = path.join(ROOT, "src/content/docs");
const ASSETS = path.join(ROOT, "public/upstream-assets");
const BASELINES = path.join(ROOT, "src/content/upstream-translation-reviews.json");
const MANIFEST = ".generated-upstream.json";
const UPSTREAM = "https://github.com/diegosouzapw/OmniRoute/blob";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const posix = (value) => value.split(path.sep).join("/");
const encode = (value) => value.split("/").map(encodeURIComponent).join("/");
const exists = async (file) => {
  try {
    return (await stat(file)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};
const isDirectory = async (file) => {
  try {
    return (await stat(file)).isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};
const inside = (root, file) => file.startsWith(`${root}${path.sep}`) || file === root;
const route = (locale, slug) => `/${locale}/${slug ? `${slug}/` : ""}`;
const FENCED_CODE = /^[ \t]{0,3}(```|~~~)[^\n]*\n[\s\S]*?^[ \t]{0,3}\1[ \t]*(?=\n|$)/gmu;

function parseDocument(original, file) {
  let body = original.replace(/\r\n?/gu, "\n");
  let title;
  let description;
  if (body.startsWith("---\n")) {
    const frontmatter = body.match(/^---\n([\s\S]*?)\n---\n/u);
    if (!frontmatter) throw new Error(`Unterminated frontmatter in ${file}`);
    for (const line of frontmatter[1].split("\n")) {
      if (!line.trim()) continue;
      const field = line.match(/^([\w-]+):\s*(.*)$/u);
      if (!field) throw new Error(`Unsupported frontmatter in ${file}: ${line}`);
      if (field[1] === "title" || field[1] === "description") {
        const value = field[2].trim();
        if (!value) throw new Error(`Empty ${field[1]} in ${file}`);
        let parsed;
        try {
          parsed = value.startsWith('"') ? JSON.parse(value)
            : value.startsWith("'") && value.endsWith("'") ? value.slice(1, -1) : value;
        } catch {
          throw new Error(`Malformed ${field[1]} in ${file}`);
        }
        if (typeof parsed !== "string") throw new Error(`Malformed ${field[1]} in ${file}`);
        if (field[1] === "title") title = parsed;
        else description = parsed;
      }
    }
    body = body.slice(frontmatter[0].length);
  }
  // Upstream's 67-language index is not the site's ten-language selector.
  body = body.replace(/^.*🌐 \*\*Languages:\*\*.*\n/gmu, "");
  body = body.replace(/<div align="center">\s*<b>🌐 [^<]*<\/b>[\s\S]*?<\/div>/gu, "");
  body = body.replace(/<code>([\s\S]*?)<\/code>/gu, (_, text) =>
    `<code>${text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</code>`);
  const allowed = new Set(["a", "b", "br", "code", "details", "div", "h3", "i", "img", "p", "picture", "source", "strong", "sub", "summary", "table", "td", "th", "tr"]);
  body = body.replace(/<([a-z][\w-]*)>/gu, (tag, name) =>
    !allowed.has(name) && !body.includes(`</${name}>`) && !["script", "style", "iframe"].includes(name)
      ? `&lt;${name}&gt;` : tag);
  body = body.replace(/<([a-z][\w-]* [a-z][\w-]*)>/gu, "&lt;$1&gt;");
  const withoutCode = body.replace(FENCED_CODE, "")
    .replace(/`+[^`\n]+`+/gu, "");
  if (/^\s*(?:import|export)\s.+$/mu.test(withoutCode)) {
    throw new Error(`MDX imports/exports are not supported in ${file}`);
  }
  if (/<[a-z][^>]*\son[a-z]+\s*=/iu.test(withoutCode)) {
    throw new Error(`HTML event handlers are not supported in ${file}`);
  }
  if (/<[a-z][^>]*\b(?:src|href)\s*=\s*(?!["'])\S+/iu.test(withoutCode)) {
    throw new Error(`Unquoted HTML links are not supported in ${file}`);
  }
  for (const match of withoutCode.matchAll(/<\/?([A-Za-z][\w.-]*)(?=[\s/>])/gu)) {
    if (!allowed.has(match[1])) {
      throw new Error(`Unsupported HTML or MDX element <${match[1]}> in ${file}`);
    }
  }
  const heading = body.match(/^#\s+(.+?)\s*#*\s*$/mu);
  title ??= heading?.[1] ?? path.basename(file, ".md").replaceAll(/[-_]/gu, " ");
  if (heading?.[1] === title) body = body.replace(/^#\s+.+?\s*#*\s*$/mu, "");
  return { title, description, body: body.trimStart() };
}

async function rewriteTargets(body, transform) {
  const protectedCode = [];
  let result = body.replace(FENCED_CODE, (text) => {
    protectedCode.push(text);
    return `OMNIROUTE_CODE_${protectedCode.length - 1}_TOKEN`;
  });
  result = result.replace(/(`+)(?!`)([^\n]*?)\1(?!`)/gu, (text) => {
    protectedCode.push(text);
    return `OMNIROUTE_CODE_${protectedCode.length - 1}_TOKEN`;
  });
  const replacements = [];
  for (const { regex, group } of [
    { regex: /(\[!\[[^\]]*\]\([^)]+\)\]\()([^\s)]+)(\))/gu, group: 2 },
    { regex: /(!?\[[^\]]*\]\()(<[^>]+>|[^\s)]+)(\s+(?:"[^"]*"|'[^']*'))?(\))/gu, group: 2 },
    { regex: /^(\s*\[[^\]]+\]:\s*)(<?)(\S+?)(>?)(\s+(?:"[^"]*"|'[^']*'))?\s*$/gmu, group: 3 },
    { regex: /\b(src|href)=(["'])([^"']+)\2/giu, group: 3 },
  ]) {
    for (const match of result.matchAll(regex)) {
      const target = match[group];
      const offset = match.index + match[0].indexOf(target, match[1].length);
      const transformed = target.startsWith("<") && target.endsWith(">")
        ? `<${await transform(target.slice(1, -1))}>` : await transform(target);
      replacements.push({ start: offset, end: offset + target.length, value: transformed });
    }
  }
  for (const { start, end, value } of replacements.sort((a, b) => b.start - a.start)) {
    result = `${result.slice(0, start)}${value}${result.slice(end)}`;
  }
  return result.replace(/OMNIROUTE_CODE_(\d+)_TOKEN/gu, (token, index) => protectedCode[Number(index)] ?? token);
}

export async function createImportPlan({
  sourceDir = SOURCE,
  revision,
  topics,
  locales = LANGUAGE_OPTIONS.map(({ code }) => code),
} = {}) {
  sourceDir = path.resolve(sourceDir);
  if (!await exists(path.join(sourceDir, "README.md"))) {
    throw new Error(`OmniRoute checkout missing or uninitialized at ${sourceDir}; run git submodule update --init vendor/OmniRoute`);
  }
  topics ??= await discoverTopics(sourceDir);
  revision ??= sourceDir === SOURCE
    ? execFileSync("git", ["-C", sourceDir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim()
    : "fixture";
  const selected = new Map(Object.entries(topics).map(([file, slug]) => [path.resolve(sourceDir, file), slug]));
  const routes = new Set();
  for (const slug of selected.values()) {
    if (routes.has(slug)) throw new Error(`Duplicate site topic route: ${slug}`);
    routes.add(slug);
  }
  for (const english of selected.keys()) {
    if (!inside(sourceDir, english) || !english.endsWith(".md") || !await exists(english)) {
      throw new Error(`Selected English source is missing: ${english}`);
    }
  }
  const selectedTranslations = new Map();
  for (const [english, slug] of selected) {
    for (const locale of locales.filter((code) => code !== "en-US")) {
      selectedTranslations.set(path.join(sourceDir, translatedSource(posix(path.relative(sourceDir, english)), locale)), { locale, slug });
    }
  }
  const documents = new Map();
  const translations = new Map();
  const assets = new Map();
  for (const [english, slug] of selected) {
    const englishRelative = posix(path.relative(sourceDir, english));
    const englishSource = await readFile(english, "utf8");
    for (const locale of locales) {
      const candidate = path.join(sourceDir, translatedSource(englishRelative, locale));
      const translated = locale !== "en-US" && await exists(candidate);
      const file = translated ? candidate : english;
      const relative = posix(path.relative(sourceDir, file));
      const original = translated ? await readFile(file, "utf8") : englishSource;
      const parsed = parseDocument(original, relative);
      const output = `${locale}/${slug ? `${slug}/index.md` : "index.md"}`;
      if (documents.has(output)) throw new Error(`Duplicate output route: ${output}`);
      if (translated) translations.set(`${locale}/${englishRelative}`, { source: englishRelative, sha256: hash(englishSource), revision });

      async function transform(target) {
        if (/^(?:javascript|data|vbscript):/iu.test(target)) {
          throw new Error(`Unsupported URL scheme ${target} in ${relative}`);
        }
        if (!target || target.startsWith("#") || /^(?:[a-z][\w+.-]*:|\/\/)/iu.test(target)) return target;
        const match = target.match(/^([^?#]*)(.*)$/u);
        let decoded;
        try {
          decoded = decodeURIComponent(match[1]);
        } catch {
          throw new Error(`Invalid encoded reference ${target} in ${relative}`);
        }
        const resolved = decoded.startsWith("/") ? path.resolve(sourceDir, `.${decoded}`) : path.resolve(path.dirname(file), decoded);
        if (!inside(sourceDir, resolved)) throw new Error(`Local reference escapes upstream checkout: ${target} in ${relative}`);
        let actual = resolved;
        if (!await exists(actual) && !await isDirectory(actual) && translated) {
          const englishEquivalent = path.resolve(path.dirname(english), decoded);
          if (inside(sourceDir, englishEquivalent)
            && (await exists(englishEquivalent) || await isDirectory(englishEquivalent))) actual = englishEquivalent;
          else {
            const sharedAsset = path.resolve(sourceDir, "docs", decoded.replace(/^(?:\.\.\/)+/u, ""));
            if (inside(sourceDir, sharedAsset)
              && (await exists(sharedAsset) || await isDirectory(sharedAsset))) actual = sharedAsset;
            else {
              const sharedRoot = path.resolve(sourceDir, decoded.replace(/^(?:\.\.\/)+/u, ""));
              if (inside(sourceDir, sharedRoot)
                && (await exists(sharedRoot) || await isDirectory(sharedRoot))) actual = sharedRoot;
            }
          }
        }
        if (!await exists(actual) && !await isDirectory(actual)) throw new Error(`Missing local reference ${target} in ${relative}`);
        const selectedSlug = selected.get(actual);
        if (selectedSlug !== undefined) return `${route(locale, selectedSlug)}${match[2]}`;
        const localized = selectedTranslations.get(actual);
        if (localized) return `${route(localized.locale, localized.slug)}${match[2]}`;
        const sourcePath = posix(path.relative(sourceDir, actual));
        if (await isDirectory(actual)) return `${UPSTREAM}/${revision}/${encode(sourcePath)}${match[2]}`;
        if (actual.endsWith(".md")) return `${UPSTREAM}/${revision}/${encode(sourcePath)}${match[2]}`;
        if (!/\.(?:avif|gif|ico|jpe?g|png|svg|webp|pdf|mp4|webm)$/iu.test(actual)) {
          return `${UPSTREAM}/${revision}/${encode(sourcePath)}${match[2]}`;
        }
        const assetPath = `${locale}/${sourcePath}`;
        assets.set(assetPath, actual);
        return `/upstream-assets/${encode(assetPath)}${match[2]}`;
      }

      const body = await rewriteTargets(parsed.body, transform);
      const metadata = [
        `title: ${JSON.stringify(parsed.title)}`,
        ...(parsed.description ? [`description: ${JSON.stringify(parsed.description)}`] : []),
        ...(locale !== "en-US" && !translated ? ["isEnglishFallback: true"] : []),
      ];
      documents.set(output, {
        rendered: `---\n${metadata.join("\n")}\n---\n\n${body.trimEnd()}\n\n---\n\n[${SITE_COPY[locale].omniRouteSourceLabel} (${revision.slice(0, 12)})](${UPSTREAM}/${revision}/${encode(relative)})\n`,
        source: englishRelative,
        translation: translated ? relative : null,
      });
    }
  }
  return { revision, documents, assets, translations };
}

async function generatedFiles(contentRoot) {
  const manifestPath = path.join(contentRoot, MANIFEST);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw new Error(`Invalid generated content manifest ${manifestPath}: ${error.message}`);
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error(`Invalid generated content manifest ${manifestPath}`);
  }
  for (const [relative, expected] of Object.entries(manifest)) {
    if (!/^(?:zh-CN|en-US|zh-Hant|ja-JP|ko-KR|de-DE|fr-FR|es-ES|pt-BR|ru-RU)\/(?:[\w-]+\/)*index\.md$/u.test(relative)
      || !/^[a-f\d]{64}$/u.test(expected)) throw new Error(`Invalid generated path or hash: ${relative}`);
  }
  return manifest;
}

export async function writeImportPlan(plan, { contentRoot = CONTENT, assetsDir = ASSETS } = {}) {
  const previous = await generatedFiles(contentRoot);
  const next = {};
  for (const [relative, { rendered }] of plan.documents) next[relative] = hash(rendered);
  for (const relative of new Set([...Object.keys(previous), ...Object.keys(next)])) {
    const destination = path.join(contentRoot, relative);
    if (!await exists(destination)) continue;
    if (!previous[relative] || hash(await readFile(destination)) !== previous[relative]) {
      throw new Error(`Preserving non-generated or edited content: ${destination}`);
    }
  }
  for (const relative of Object.keys(previous)) await rm(path.join(contentRoot, relative), { force: true });
  for (const [relative, { rendered }] of plan.documents) {
    const destination = path.join(contentRoot, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, rendered, "utf8");
  }
  await rm(assetsDir, { recursive: true, force: true });
  for (const [relative, source] of plan.assets) {
    const destination = path.join(assetsDir, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
  await writeFile(path.join(contentRoot, MANIFEST), `${JSON.stringify(next, null, 2)}\n`);
}

export async function importEnglishDocs(options = {}) {
  let plan;
  try {
    plan = await createImportPlan(options);
  } catch (error) {
    const contentRoot = options.contentRoot ?? CONTENT;
    const previous = await generatedFiles(contentRoot);
    for (const relative of Object.keys(previous)) {
      const destination = path.join(contentRoot, relative);
      if (await exists(destination) && hash(await readFile(destination)) === previous[relative]) await rm(destination);
    }
    await rm(path.join(contentRoot, MANIFEST), { force: true });
    await rm(options.assetsDir ?? ASSETS, { recursive: true, force: true });
    throw error;
  }
  await writeImportPlan(plan, options);
  return plan;
}

export async function checkTranslationBaselines({ sourceDir = SOURCE, manifestPath = BASELINES, topics, locales, revision } = {}) {
  const plan = await createImportPlan({ sourceDir, topics, locales, revision });
  const reviewed = JSON.parse(await readFile(manifestPath, "utf8"));
  const messages = [];
  if (reviewed.revision !== plan.revision) messages.push("Pinned upstream revision changed; review selected translations");
  for (const [key, value] of plan.translations) {
    if (reviewed.sources?.[value.source] !== value.sha256) messages.push(`${key}: English source changed; review the translation`);
    if (!reviewed.translations?.includes(key)) messages.push(`${key}: translation has no reviewed English source baseline`);
  }
  for (const key of reviewed.translations ?? []) {
    if (!plan.translations.has(key)) messages.push(`${key}: reviewed translation or English source was removed`);
  }
  for (const source of Object.keys(reviewed.sources ?? {})) {
    if (![...plan.translations.values()].some((entry) => entry.source === source)) {
      messages.push(`${source}: reviewed English source was removed`);
    }
  }
  if (messages.length) throw new Error(`Translation review required:\n- ${messages.join("\n- ")}`);
  return { revision: plan.revision, checkedTranslations: plan.translations.size };
}
