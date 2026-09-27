import { checkTranslationBaselines } from "./english-source.mjs";

const result = await checkTranslationBaselines();
console.log(`Checked ${result.checkedTranslations} OmniRoute translation baselines.`);
