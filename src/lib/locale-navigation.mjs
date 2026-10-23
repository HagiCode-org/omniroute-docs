import { LANGUAGE_OPTIONS } from "../i18n/site-copy.mjs";

const SUPPORTED_LOCALES = LANGUAGE_OPTIONS.map(({ code }) => code);

function topicParts(value) {
  const segments = value.replace(/\.(md|mdx)$/u, "").split("/").filter(Boolean);
  if (SUPPORTED_LOCALES.includes(segments[0])) segments.shift();
  if (segments.at(-1) === "index") segments.pop();
  return segments.join("/");
}

export function getEnglishTopicHref(pathname) {
  const topic = topicParts(pathname);
  return topic ? `/en-US/${topic}/` : "/en-US/";
}
