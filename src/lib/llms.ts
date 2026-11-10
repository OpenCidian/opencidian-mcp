import type { McpConfig } from "../../kit/core/config.js";

/**
 * `/llms.txt`: what OpenCidian is and how to connect, for people and for assistants that read it.
 * The tool list comes from the config, so it can't drift from what `tools/list` returns.
 */
export function renderLlmsTxt(config: McpConfig, publicUrl: string): string {
  const mcpUrl = `${publicUrl}/mcp`;
  const tools = config.tools.map((t) => `- \`${t.name}\`: ${firstSentence(t.description)}`).join("\n");
  return `# OpenCidian by Perxel

> An open Chinese-Vietnamese dictionary, served to AI assistants over MCP. Hán Việt, pinyin and Vietnamese meaning for every word, and every field says which source it came from. Free, no sign-in; read-only except suggest_correction, which opens a public issue for review.

OpenCidian joins CC-CEDICT (Chinese-English), CVDICT (Chinese-Vietnamese), Thiều Chửu's Hán Việt tự điển, Unihan, Make Me a Hanzi and the HSK word lists into one dataset of about 125,000 words and 14,500 characters, each source pinned to a version. Questions can be asked in Vietnamese or English.

There is no public REST API: for assistants and other systems, the MCP server is the way in.

## Connect

MCP server (Streamable HTTP, no auth): ${mcpUrl}

- Claude (claude.ai, Desktop, mobile): Settings → Connectors → Add custom connector → paste the URL.
- Claude Code: \`claude mcp add --transport http ${config.slug} ${mcpUrl}\`
- ChatGPT: Settings → Apps & Connectors → Advanced settings → turn on Developer mode → Create, then paste the URL (no authentication).
- Cursor, VS Code and other clients with an \`mcp.json\`: \`{ "mcpServers": { "${config.slug}": { "url": "${mcpUrl}" } } }\`
- Clients that only speak stdio: \`npx mcp-remote ${mcpUrl}\`

## Try asking

- 觉得 nghĩa là gì? Âm Hán Việt là gì?
- "Cảm thấy" tiếng Trung nói thế nào?
- Chữ 觉 có những âm Hán Việt nào, gồm những bộ phận gì?
- Những từ thông dụng nào có chữ 觉?
- Phiên âm và nghĩa từng từ trong câu: 他觉得北京很好。
- Where does OpenCidian's data come from, and how do I cite it?

## Tools

${tools}

## Trust

- Every field carries \`src\`: the source it came from, or a correction.
- Every answer carries the dataset version.
- A word the dictionary doesn't have is reported as missing, never guessed.

## License and attribution

The data is CC BY-SA 4.0: credit "OpenCidian by Perxel" and its sources (the \`about\` tool gives the full credit), link to ${publicUrl}, and share changes under the same licence. The code is MIT.

## Links

- Docs page and tool list: ${publicUrl}/
- Usage dashboard: ${publicUrl}/dash
- Perxel: https://perxel.com
- Contact: ${config.docs.contact}
`;
}

function firstSentence(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  const end = flat.search(/[.!?](\s|$)/);
  return end === -1 ? flat : flat.slice(0, end + 1);
}
