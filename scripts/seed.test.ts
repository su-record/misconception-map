import Database from "better-sqlite3";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const dbPath = path.join(os.tmpdir(), `mismap-seed-${process.pid}.db`);
afterEach(() => { if (fs.existsSync(dbPath)) fs.rmSync(dbPath); });

describe("seed taxonomy", () => {
  it("gives every concept at least one misconception", () => {
    execFileSync("npm", ["run", "seed"], { cwd: process.cwd(), env: { ...process.env, DATABASE_PATH: dbPath }, stdio: "ignore" });
    const db = new Database(dbPath, { readonly: true });
    const uncovered = db.prepare(`SELECT c.slug FROM concepts c LEFT JOIN misconceptions m ON m.concept_id = c.id
      GROUP BY c.id HAVING COUNT(m.id) = 0`).all();
    db.close();
    expect(uncovered).toEqual([]);
  }, 30_000);
});
