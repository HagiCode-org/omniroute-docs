import type { APIContext } from "astro";
import { getDocsRssResponse } from "../lib/docs-rss";

export function GET(context: APIContext) {
  return getDocsRssResponse(context);
}
