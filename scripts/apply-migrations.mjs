import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { Client } = require("pg");

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required to apply migrations.");
  process.exit(2);
}

const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

await client.connect();

try {
  await client.query(`
    create table if not exists supabase_migrations.schema_migrations (
      version text primary key,
      name text,
      statements text[]
    );
  `);
} catch {
  await client.query("create schema if not exists supabase_migrations;");
  await client.query(`
    create table if not exists supabase_migrations.schema_migrations (
      version text primary key,
      name text,
      statements text[]
    );
  `);
}

const applied = new Set(
  (await client.query("select version from supabase_migrations.schema_migrations")).rows.map((row) => row.version)
);

for (const file of files) {
  const version = file.replace(/\.sql$/, "");
  if (applied.has(version)) {
    continue;
  }

  const sql = await readFile(join(migrationsDir, file), "utf8");
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query(
      "insert into supabase_migrations.schema_migrations (version, name) values ($1, $2)",
      [version, file]
    );
    await client.query("commit");
    console.log(`applied ${file}`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

await client.end();
console.log("migrations complete");
