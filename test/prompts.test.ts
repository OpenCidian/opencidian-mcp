import { describe, expect, it } from "vitest";

import config from "../mcp.config.js";
import { renderLlmsTxt } from "../src/lib/llms.js";
import { renderWordAnalysis, wordAnalysisArgsSchema } from "../src/prompts/word-analysis.js";

describe("word-analysis prompt", () => {
  it("is in the config and listed in /llms.txt", () => {
    expect(config.prompts?.map((p) => p.name)).toEqual(["word-analysis"]);
    expect(renderLlmsTxt(config, "https://mcp.example")).toContain("## Prompts");
    expect(renderLlmsTxt(config, "https://mcp.example")).toContain("`word-analysis`");
  });

  it("takes a character, a word or an idiom, nothing else", () => {
    for (const word of ["重", "重要", "贵人多忘事", " 覺 "]) expect(wordAnalysisArgsSchema.safeParse({ word }).success).toBe(true);
    for (const word of ["", "abc", "重 要", "chóng"]) expect(wordAnalysisArgsSchema.safeParse({ word }).success).toBe(false);
  });

  it("names the word, the tools to call first, and only tools that exist", () => {
    const text = renderWordAnalysis({ word: "重要" });
    expect(text).toContain("Phân tích 重要");
    const names = new Set(config.tools.map((t) => t.name));
    const mentioned = [...text.matchAll(/`([a-z_]+)`/g)].map((m) => m[1]!);
    expect(mentioned).toEqual(expect.arrayContaining(["lookup", "get_character", "words_with"]));
    for (const name of mentioned) expect(names.has(name) || name === "vi").toBe(true);
  });

  it("keeps hieu-chu-han's sections, adds stroke count, drops the app's links", () => {
    const text = renderWordAnalysis({ word: "重" });
    for (const s of ["**Hán Việt:**", "**Số nét:**", "**Nguồn gốc:**", "**Lục thư:**", "**Từ liên quan:**", "**Lưu ý sử dụng**", "**Ví dụ:**", "**Nghĩa đầy đủ:**"]) {
      expect(text).toContain(s);
    }
    expect(text).not.toContain("?word=");
  });
});
