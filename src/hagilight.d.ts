declare module "@hagicode/hagilight-starlight/article-promotion-schema" {
  import type { ZodBoolean, ZodObject, ZodOptional } from "astro/zod";

  export const articlePromotionSchema: ZodObject<{
    hagicodePromotion: ZodOptional<ZodBoolean>;
  }>;
}
