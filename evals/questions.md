# Eval questions

The questions OpenCidian must answer well (opencidian-data plan 001, "opencidian-mcp"), as tool calls
against a running server (`pnpm eval --url http://localhost:8788/mcp`). Each `##` section is one
question: `- tool:` lines name a tool and its JSON arguments, `- expect:` lines are facts that must
appear in the tool result.

## Hán Việt of a compound: 觉得 đọc Hán Việt là gì?

- tool: lookup {"q": "觉得"}
- expect: giác
- expect: đắc
- expect: cảm thấy

## A character with more than one reading: 觉 có mấy âm Hán Việt?

- tool: get_character {"char": "觉"}
- expect: giác
- expect: giáo
- expect: jué

## Traditional form in, same answer: 覺

- tool: get_character {"char": "覺"}
- expect: giác

## Pinyin without tones

- tool: lookup {"q": "jue de", "by": "pinyin"}
- expect: 觉得

## Vietnamese → Chinese: "cảm thấy" tiếng Trung là gì?

- tool: search_meaning {"meaning": "cảm thấy"}
- expect: 感到

## English → Chinese

- tool: search_meaning {"meaning": "to sleep", "lang": "en"}
- expect: 睡

## Words that contain a character

- tool: words_with {"char": "觉"}
- expect: 睡觉

## A lesson sentence from OUC (Kỹ năng đọc 1, B01)

- tool: annotate_text {"text": "我不是留学生，我是老师。"}
- expect: 留学生
- expect: lưu
- expect: 老师

## A word that isn't in the dictionary: must say so, not guess

- tool: lookup {"q": "龘龘龘"}
- expect: "entries":[]

## Where the data comes from and how to cite it

- tool: about {}
- expect: CC-BY-SA-4.0
- expect: Thiều Chửu
