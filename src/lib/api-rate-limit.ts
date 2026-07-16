import { NextResponse } from "next/server";
import { clientIp, llmRateLimiter } from "./rate-limit";

const LIMIT_MESSAGE = "This public demo has reached its AI request limit. Please try again later, or run the project locally without an API key to use the included fixtures.";

export function enforceLlmRateLimit(request: Request) {
  if (!process.env.OPENAI_API_KEY) return null;
  const result = llmRateLimiter.check(clientIp(request));
  if (result.allowed) return null;
  return NextResponse.json(
    { error: LIMIT_MESSAGE, code: "RATE_LIMITED", retryAfterSeconds: result.retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds), "Cache-Control": "no-store" } },
  );
}
