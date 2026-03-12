/**
 * Shared Tool-Result Processing — eliminiert Boilerplate in AG02/AG04/AG05/AG07.
 *
 * Jeder Agent definiert seine ToolHandler-Map mit Execute-Funktion + optionalem Seiteneffekt.
 * processToolBlocks() iteriert über die Tool-Use-Blöcke und gibt fertige ToolResultBlockParams zurück.
 */

import type Anthropic from "@anthropic-ai/sdk";

export type ToolHandler = {
  execute: (input: Record<string, unknown>) => Promise<string> | string;
};

/**
 * Verarbeitet alle tool_use-Blöcke einer Anthropic-Response.
 * Gibt fertige ToolResultBlockParam[] zurück.
 */
export async function processToolBlocks(
  content: Anthropic.ContentBlock[],
  handlers: Record<string, ToolHandler>,
): Promise<Anthropic.ToolResultBlockParam[]> {
  const results: Anthropic.ToolResultBlockParam[] = [];

  for (const block of content) {
    if (block.type !== "tool_use") continue;

    const handler = handlers[block.name];
    const resultContent = handler
      ? await handler.execute(block.input as Record<string, unknown>)
      : JSON.stringify({ error: "Unbekanntes Tool" });

    results.push({
      type: "tool_result",
      tool_use_id: block.id,
      content: resultContent,
    });
  }

  return results;
}
