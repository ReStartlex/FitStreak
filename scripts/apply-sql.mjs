import fs from "node:fs";
import { config } from "dotenv";
import pkg from "pg";

config({ path: ".env" });

const { Client } = pkg;
const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/apply-sql.mjs <path/to/file.sql>");
  process.exit(1);
}

const sql = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
console.log("→ host:", new URL(url).host);
console.log("→ size:", sql.length, "chars");

const c = new Client({ connectionString: url });
await c.connect();
try {
  await c.query(sql);
  console.log("✓ applied", file);
} catch (e) {
  console.error("✗ failed:", e.message);
  process.exitCode = 1;
} finally {
  await c.end();
}
