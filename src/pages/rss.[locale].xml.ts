import type { APIContext, GetStaticPaths } from "astro";
import { LANGUAGE_OPTIONS } from "../i18n/site-copy.mjs";
import { getDocsRssResponse } from "../lib/docs-rss";

export const getStaticPaths: GetStaticPaths = () => LANGUAGE_OPTIONS.map(({ code }) => ({
  params: { locale: code },
}));

export function GET(context: APIContext) {
  const locale = LANGUAGE_OPTIONS.find(({ code }) => code === context.params.locale)?.code;
  if (!locale) throw new Error(`Unsupported RSS locale: ${context.params.locale}`);
  return getDocsRssResponse(context, locale);
}
