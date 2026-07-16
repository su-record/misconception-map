import { describe, expect, it } from "vitest";
import { createSlidingWindowLimiter } from "./rate-limit";

describe("sliding window limiter", () => {
  it("limits one IP and permits it after the window expires", () => {
    const limiter = createSlidingWindowLimiter({ perKeyLimit: 2, globalLimit: 10, windowMs: 1_000 });
    expect(limiter.check("student", 0).allowed).toBe(true);
    expect(limiter.check("student", 100).allowed).toBe(true);
    expect(limiter.check("student", 200)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(limiter.check("student", 1_001).allowed).toBe(true);
  });

  it("enforces one global cap across different IPs", () => {
    const limiter = createSlidingWindowLimiter({ perKeyLimit: 5, globalLimit: 2, windowMs: 60_000 });
    expect(limiter.check("one", 0).allowed).toBe(true);
    expect(limiter.check("two", 1).allowed).toBe(true);
    expect(limiter.check("three", 2).allowed).toBe(false);
  });
});
