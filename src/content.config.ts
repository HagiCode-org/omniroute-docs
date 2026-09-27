import { defineCollection } from "astro:content";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { z } from "astro/zod";

function generateDocumentId({ entry }: { entry: string }) {
  const segments = entry.replace(/\.[^./]+$/u, "").split("/");
  if (segments[0]?.toLowerCase() === "en-us") segments[0] = "en-US";
  return segments.join("/");
}

export const collections = {
  docs: defineCollection({
    loader: docsLoader({ generateId: generateDocumentId }),
    schema: docsSchema({
      extend: z.object({ isEnglishFallback: z.boolean().optional() }),
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
