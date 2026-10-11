import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Null om nyckeln saknas (t.ex. lokalt innan den satts upp) – anroparen
// avgör hur det hanteras istället för att krascha vid import.
export function getClaudeClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}
