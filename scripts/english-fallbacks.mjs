import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANGUAGE_OPTIONS } from "../src/i18n/site-copy.mjs";

const SUPPORTED_LOCALES = LANGUAGE_OPTIONS.map(({ code }) => code);

const IGNORE_START = "# BEGIN generated English fallback docs";
const IGNORE_END = "# END generated English fallback docs";
const MANIFEST_NAME = ".generated-english-fallbacks.json";
const DOCS_ROOT = path.resolve(fileURLToPath(new URL("../src/content/docs", import.meta.url)));
const ROOT_GITIGNORE = path.resolve(fileURLToPath(new URL("../.gitignore", import.meta.url)));

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function validateRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    throw new Error("Invalid generated fallback path in manifest");
  }

  const segments = value.split("/");
  if (
    segments.length < 2
    || !SUPPORTED_LOCALES.includes(segments[0])
    || segments[0] === "en-US"
    || segments.some((segment) => !segment || segment === "." || segment === "..")
    || !segments.at(-1).endsWith(".md")
  ) {
    throw new Error(`Invalid generated fallback path in manifest: ${value}`);
  }
  return value;
}

async function readManifest(contentRoot) {
  const manifestPath = path.join(contentRoot, MANIFEST_NAME);
  let source;
  try {
    source = await readFile(manifestPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw new Error(`Unable to read generated fallback manifest ${manifestPath}: ${error.message}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid generated fallback manifest ${manifestPath}: ${error.message}`);
  }
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.files)) {
    throw new Error(`Invalid generated fallback manifest ${manifestPath}: expected version 1 and a files array`);
  }

  const files = new Map();
  for (const file of manifest.files) {
    if (!file || typeof file !== "object" || Array.isArray(file)) {
      throw new Error(`Invalid generated fallback manifest ${manifestPath}: each file entry must be an object`);
    }
    const relativePath = validateRelativePath(file.path);
    if (!/^[a-f\d]{64}$/u.test(file.sha256 ?? "")) {
      throw new Error(`Invalid generated fallback hash for ${relativePath}`);
    }
    if (files.has(relativePath)) {
      throw new Error(`Duplicate generated fallback path in manifest: ${relativePath}`);
    }
    files.set(relativePath, file.sha256);
  }
  return files;
}

async function readFileHash(filePath) {
  try {
    return hash(await readFile(filePath));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function fallbackRenderedContent(rendered) {
  const separator = rendered.indexOf("\n---\n");
  if (!rendered.startsWith("---\n") || separator < 0) {
    throw new Error("Imported English document has invalid frontmatter");
  }
  return `${rendered.slice(0, separator)}\nisEnglishFallback: true${rendered.slice(separator)}`;
}

async function updateIgnoreFile(ignoreFile, contentRoot, generatedPaths) {
  let current;
  try {
    current = await readFile(ignoreFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error(`Unable to read ignore file ${ignoreFile}: ${error.message}`);
    }
    current = "";
  }

  const markerCount = (source, marker) => source.split(marker).length - 1;
  if (
    markerCount(current, IGNORE_START) !== markerCount(current, IGNORE_END)
    || current.includes(IGNORE_START) !== current.includes(IGNORE_END)
    || current.indexOf(IGNORE_END) < current.indexOf(IGNORE_START)
  ) {
    throw new Error(`Incomplete generated fallback ignore block in ${ignoreFile}`);
  }

  const relativeToIgnoreFile = (filePath) =>
    path.relative(path.dirname(ignoreFile), filePath).split(path.sep).join("/");
  const entries = [
    `${relativeToIgnoreFile(path.join(path.dirname(contentRoot), ".english-fallback-stage-*"))}/`,
    ...generatedPaths.map((relativePath) =>
      `/${relativeToIgnoreFile(path.join(contentRoot, ...relativePath.split("/"))).replaceAll(" ", "\\ ")}`),
  ];
  const block = `${IGNORE_START}\n${entries.sort().join("\n")}\n${IGNORE_END}`;
  const start = current.indexOf(IGNORE_START);
  const end = current.indexOf(IGNORE_END);

  if (start >= 0) {
    if (current.indexOf(IGNORE_START, start + IGNORE_START.length) >= 0
      || current.indexOf(IGNORE_END, end + IGNORE_END.length) >= 0) {
      throw new Error(`Duplicate generated fallback ignore blocks in ${ignoreFile}`);
    }
    const endOfBlock = end + IGNORE_END.length;
    current = `${current.slice(0, start)}${block}${current.slice(endOfBlock)}`;
  } else {
    current = `${current.trimEnd()}${current ? "\n\n" : ""}${block}\n`;
  }
  await writeFile(ignoreFile, current, "utf8");
}

export async function writeEnglishFallbacks(plan, {
  contentRoot,
  ignoreFile,
  locales = SUPPORTED_LOCALES,
} = {}) {
  const resolvedContentRoot = path.resolve(contentRoot);
  const resolvedIgnoreFile = ignoreFile
    ? path.resolve(ignoreFile)
    : resolvedContentRoot === DOCS_ROOT
      ? ROOT_GITIGNORE
      : path.join(path.dirname(resolvedContentRoot), ".gitignore");
  const previous = await readManifest(resolvedContentRoot);
  const authoredPaths = new Set();

  for (const [relativePath, expectedHash] of previous) {
    const currentHash = await readFileHash(path.join(resolvedContentRoot, ...relativePath.split("/")));
    if (currentHash !== null && currentHash !== expectedHash) authoredPaths.add(relativePath);
  }

  const nextFiles = new Map();
  for (const locale of locales) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      throw new RangeError(`Invalid fallback locale: ${locale}`);
    }
    if (locale === "en-US") continue;
    for (const document of plan.documents.values()) {
      if (document.output === "index.md") continue;
      const relativePath = validateRelativePath(`${locale}/${document.output}`);
      if (authoredPaths.has(relativePath)) continue;

      const destination = path.join(resolvedContentRoot, ...relativePath.split("/"));
      if (await readFileHash(destination.replace(/\.md$/u, ".mdx")) !== null) continue;
      const currentHash = await readFileHash(destination);
      if (previous.has(relativePath) && currentHash !== null) {
        nextFiles.set(relativePath, fallbackRenderedContent(document.rendered));
      } else if (currentHash === null) {
        nextFiles.set(relativePath, fallbackRenderedContent(document.rendered));
      }
    }
  }

  const staged = [];
  await mkdir(resolvedContentRoot, { recursive: true });
  const stagingRoot = await mkdtemp(path.join(path.dirname(resolvedContentRoot), ".english-fallback-stage-"));
  try {
    for (const [relativePath, rendered] of nextFiles) {
      const stagedPath = path.join(stagingRoot, ...relativePath.split("/"));
      await mkdir(path.dirname(stagedPath), { recursive: true });
      await writeFile(stagedPath, rendered, "utf8");
      staged.push({ relativePath, stagedPath, sha256: hash(rendered) });
    }

    const nextManifest = new Map(staged.map(({ relativePath, sha256 }) => [relativePath, sha256]));
    const stalePaths = [...previous.keys()].filter(
      (relativePath) => !nextManifest.has(relativePath) && !authoredPaths.has(relativePath),
    );
    const ignoredPaths = [...nextManifest.keys()].sort();
    await updateIgnoreFile(resolvedIgnoreFile, resolvedContentRoot, ignoredPaths);

    for (const { relativePath, stagedPath } of staged) {
      const destination = path.join(resolvedContentRoot, ...relativePath.split("/"));
      const currentHash = await readFileHash(destination);
      const previousHash = previous.get(relativePath);
      if (
        (previousHash === undefined && currentHash !== null)
        || (previousHash !== undefined && currentHash !== null && currentHash !== previousHash)
      ) {
        throw new Error(`Fallback destination changed during generation; preserving ${destination}`);
      }
      await mkdir(path.dirname(destination), { recursive: true });
      await rename(stagedPath, destination);
    }

    for (const relativePath of stalePaths) {
      const destination = path.join(resolvedContentRoot, ...relativePath.split("/"));
      if (await readFileHash(destination) === previous.get(relativePath)) {
        await rm(destination);
      }
    }

    const manifestPath = path.join(resolvedContentRoot, MANIFEST_NAME);
    const manifestStagingPath = path.join(stagingRoot, MANIFEST_NAME);
    const files = [...nextManifest]
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([relativePath, sha256]) => ({ path: relativePath, sha256 }));
    await writeFile(manifestStagingPath, JSON.stringify({
      version: 1,
      files,
    }, null, 2) + "\n", "utf8");
    await rename(manifestStagingPath, manifestPath);
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
}

export async function generatedFallbackPaths(contentRoot) {
  const manifest = await readManifest(path.resolve(contentRoot));
  const paths = new Set();
  for (const [relativePath, expectedHash] of manifest) {
    const currentHash = await readFileHash(path.join(contentRoot, ...relativePath.split("/")));
    if (currentHash === expectedHash) paths.add(relativePath);
  }
  return paths;
}
