import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const databasePath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "mismap.db");
let instance: Database.Database | undefined;

export function getDb() {
  if (!instance) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    instance = new Database(databasePath);
    instance.pragma("foreign_keys = ON");
  }
  return instance;
}
