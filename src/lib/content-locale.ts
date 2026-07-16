import "server-only";
import { parseLocale } from "./locale";

export function contentLocale(value: unknown) {
  return process.env.OPENAI_API_KEY ? parseLocale(value) : "en";
}
