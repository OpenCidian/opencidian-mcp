import { z } from "zod";

import { definePrompt } from "../../kit/core/prompt.js";

/**
 * The word-analysis prompt: hieu-chu-han's AI explain format (its `public/prompts/word-analysis.md`),
 * minus the app's `?word=` links, with the facts taken from the tools instead of the model's memory.
 * Make Me a Hanzi has three formation types only (no Chỉ sự, Chuyển chú, Giả tá; Chỉ sự characters
 * like 上 come as ideographic), English hints, and no etymology for ~38% of characters: the text says so.
 */
export const wordAnalysisArgsSchema = z.object({
  word: z
    .string()
    .trim()
    .regex(/^\p{Script=Han}{1,12}$/u, "1 to 12 Chinese characters")
    .describe("A Chinese character, word or idiom, simplified or traditional (重, 重要, 贵人多忘事)."),
});

export function renderWordAnalysis({ word }: z.infer<typeof wordAnalysisArgsSchema>): string {
  return `Phân tích ${word} theo định dạng dưới đây.

You are a Chinese language expert specializing in Sino-Vietnamese (Hán Việt) for Vietnamese learners. Write the whole answer in Vietnamese.

## Step 1: fetch the facts with the OpenCidian tools (before writing anything)

- \`lookup\` with "${word}": pinyin, Hán Việt per character, Vietnamese and English meanings, HSK level.
- \`get_character\` for every character in it: Hán Việt readings, pinyin, stroke count, radical, decomposition, etymology.
- \`words_with\` for the character (for a word or idiom: its main character) to pick related words.

The tools' data wins over your memory: never write a pinyin, Hán Việt reading, meaning, stroke count or component that contradicts it. Where the data has \`vi: null\`, give a meaning translated from the English and mark it "(dịch từ tiếng Anh)". If \`lookup\` finds nothing, say the dictionary doesn't have "${word}" and stop: don't analyse from memory.

Detect the input's type: a single character (e.g. 重), a compound word (e.g. 重要) or an idiom / chengyu (e.g. 贵人多忘事). Follow that case's format exactly.

---

## CASE 1: single character

## X: pinyin | nghĩa ngắn

**Hán Việt:** [readings] | **Nghĩa:** [Vietnamese meaning; if several pronunciations, list them all] | **Số nét:** [stroke count] | **Bộ:** [radical]

**Nguồn gốc:**
From \`get_character\`'s decomposition and etymology: break the character into its parts down to the smallest meaningful unit, and give each part its role: nghĩa (meaning), gợi âm (sound) or không rõ (unknown). Give each part's Hán Việt where the data has it. The etymology hint is in English: translate it, don't quote it. End with one summary line: [part A] + [part B] → original meaning. If the data has no etymology, say "Dữ liệu chưa có nguồn gốc của chữ này" and only add what you know for certain; otherwise stop there. Never invent.

**Lục thư:** [type] ([its Chinese name, e.g. 形声]): [one-sentence reason based on Nguồn gốc]
Pick exactly one of: Tượng hình (象形) · Chỉ sự (指事) · Hội ý (会意) · Hình thanh (形声) · Chuyển chú (转注) · Giả tá (假借). The data's etymology type gives three of them: pictographic → Tượng hình, pictophonetic → Hình thanh, ideographic → Hội ý **or Chỉ sự**: the data never says Chỉ sự, so choose Chỉ sự when a mark is added to a picture or a symbol shows an abstract idea (上, 下, 本, 刃), Hội ý when meaningful parts are combined (好, 休). With no etymology in the data, write "không rõ" unless the type is certain.

**Từ liên quan:**
word1 pinyin1 (nghĩa) · word2 pinyin2 (nghĩa) · word3 pinyin3 (nghĩa) · word4 pinyin4 (nghĩa) · word5 pinyin5 (nghĩa)

**Ví dụ:**

**1.** sentence. *pinyin.* (Vietnamese translation)

(5 examples, numbered 1 to 5.)

---

## CASE 2: compound word

## XY: pinyin | nghĩa ngắn

**X** pinyin · Hán Việt · nghĩa · số nét
**Y** pinyin · Hán Việt · nghĩa · số nét

**Nguồn gốc:**
For each character, as in case 1: its parts and their roles from the data, the hint translated, one summary line, then the lục thư type in parentheses: the name only, no explanation. Never invent.

**Từ liên quan:** (as in case 1)

**Ví dụ:** (as in case 1)

---

## CASE 3: idiom / chengyu

## XYZW: pinyin | nghĩa ngắn

**Nghĩa đầy đủ:** [the full idiomatic meaning, with connotation or usage context if relevant]

**X** pinyin · Hán Việt · nghĩa
(one line per character)

**Nguồn gốc:**
As in case 2, for the important characters only: skip ones too simple or purely phonetic to add anything.

**Từ liên quan:** (as in case 1)

**Ví dụ:** (as in case 1)

---

## General rules

- Never write the case labels ("CASE 1"…): the formats above are instructions only.
- Pinyin always with tone marks (ā á ǎ à).
- Related words: from \`words_with\`, HSK words first, each with pinyin and Vietnamese meaning, and every one must contain the character looked up: never words that are only related by topic.
- Examples go from simple to complex, each with pinyin and a Vietnamese translation. They are yours, not the dictionary's: keep them natural and correct.
- Etymology must be factual. Don't confuse look-alike parts (手 vs 攴, 己 vs 已).
- **Lưu ý sử dụng** (optional, any case): after Từ liên quan and before Ví dụ, only when the word has usage limits worth flagging (formal or written register, near-synonyms with a different nuance, a common learner mix-up). Skip it for simple everyday words (吃, 大, 你好). When used:
  - *Văn phong & tần suất:* formal, written, academic or casual, spoken? common or specialised?
  - *So sánh đồng nghĩa:* word (pinyin): one sentence on the difference in nuance or register. 1 to 3 words.
  - *Không nên dùng khi:* at least one situation where it sounds unnatural, and a better word.
  - *Dễ nhầm với:* only if learners often confuse them: a short side-by-side comparison.
- No other sections or commentary.
- End with one line: *Nguồn: OpenCidian by Perxel (CC BY-SA 4.0).*`;
}

export const wordAnalysisPrompt = definePrompt({
  name: "word-analysis",
  title: "Phân tích chữ / từ Hán (word analysis)",
  description:
    "Analyses a Chinese character, word or idiom for Vietnamese learners, in Vietnamese: pinyin, Hán Việt, meaning, stroke count, parts and origin, lục thư type, related words, usage notes and 5 examples. The model fetches the facts with lookup, get_character and words_with first.",
  argsSchema: wordAnalysisArgsSchema,
  render: renderWordAnalysis,
});
