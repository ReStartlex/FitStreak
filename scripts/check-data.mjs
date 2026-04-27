import { config } from "dotenv";
import pkg from "pg";
config({ path: ".env" });
const { Client } = pkg;

const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const tables = ["User", "Challenge", "Achievement", "Waitlist", "ActivityRecord"];
for (const t of tables) {
  const r = await c.query(`SELECT COUNT(*)::int as n FROM "${t}"`);
  console.log(`${t.padEnd(18)} → ${r.rows[0].n} rows`);
}
const ch = await c.query(`SELECT slug, "titleRu", difficulty FROM "Challenge" ORDER BY "isFeatured" DESC, slug LIMIT 5`);
console.log("\nFirst challenges:");
for (const r of ch.rows) console.log(`  ${r.slug.padEnd(22)} [${r.difficulty}] ${r.titleRu}`);
await c.end();
