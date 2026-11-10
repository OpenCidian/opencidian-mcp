import { defineConfig } from "./kit/core/config.js";
import { aboutTool } from "./src/tools/about.js";
import { annotateTextTool } from "./src/tools/annotate-text.js";
import { getCharacterTool } from "./src/tools/get-character.js";
import { lookupTool } from "./src/tools/lookup.js";
import { searchMeaningTool } from "./src/tools/search-meaning.js";
import { wordsWithTool } from "./src/tools/words-with.js";

export default defineConfig({
  slug: "opencidian",
  name: "OpenCidian MCP",
  version: "0.1.0",
  description:
    "OpenCidian by Perxel: an open Chinese-Vietnamese dictionary. Look up words by hanzi, pinyin or Vietnamese; Hán Việt, pinyin and Vietnamese meaning per word; characters with their parts; annotate a Chinese text word by word. Every field says which source it came from. Read-only, no sign-in. Data CC BY-SA 4.0 (credit \"OpenCidian by Perxel\"); about and how to connect: /llms.txt.",
  instructions:
    "OpenCidian: a Chinese-Vietnamese dictionary. Use it for a word's pinyin, Hán Việt or Vietnamese meaning instead of guessing. lookup takes hanzi, pinyin or Vietnamese; search_meaning finds Chinese words for a Vietnamese or English meaning; get_character for one character's readings and parts; words_with for words that contain a character; annotate_text for a whole sentence. Every field has `src`: say which source a value comes from when it matters. `vi: null` means the dictionary has no Vietnamese for that word, and no entries means the word isn't in it: say so rather than make one up. Hán Việt is given per character; a word's reading joins them and can be irregular.",
  scopes: {},
  tools: [lookupTool, getCharacterTool, wordsWithTool, searchMeaningTool, annotateTextTool, aboutTool],
  docs: { contact: "https://github.com/OpenCidian" },
});
