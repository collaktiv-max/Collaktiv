import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Null om nyckeln saknas (t.ex. lokalt innan den satts upp) – anroparen
// avgör hur det hanteras istället för att krascha vid import.
export function getClaudeClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

// Node trunkerar nästlade objekt i console.error (visas som "{…}") – det
// gömmer precis den del av Anthropic-felet (err.error) som faktiskt
// förklarar varför. Används bara i server-loggar, aldrig i svar till
// klienten.
export function describeClaudeError(err: unknown): string {
  if (err instanceof Anthropic.APIError) {
    return `status=${err.status} ${JSON.stringify(err.error)}`;
  }
  return err instanceof Error ? err.message : String(err);
}
