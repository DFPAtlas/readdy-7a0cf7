// Checks that Supabase queries in the app only reference columns that exist
// in lib/database.types.ts. Many query results are cast to `any`, so
// TypeScript alone does not catch a misspelt or missing column; this script
// does a lightweight static pass over `.from("table")` chains instead.
//
// It understands: .select("a, b, c") (top-level columns only; embedded
// relations and aliases are skipped), filter/order calls with a literal
// column name, and object-literal keys passed to insert/update/upsert.
// Template-literal selects and dynamic column names are not checked.

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const typesSource = readFileSync(path.join(root, "lib", "database.types.ts"), "utf8");

const columnsByTable = new Map();
for (const match of typesSource.matchAll(/\n {6}([a-z_]+): \{\n {8}Row: \{\n([\s\S]*?)\n {8}\}/g)) {
  const columns = new Set([...match[2].matchAll(/^\s+([a-z_0-9]+)\??:/gm)].map((m) => m[1]));
  columnsByTable.set(match[1], columns);
}

const SCAN_DIRECTORIES = ["app", "components", "lib"];
const files = [];
function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) walk(fullPath);
    else if (/\.(ts|tsx)$/.test(entry) && !fullPath.endsWith("database.types.ts")) files.push(fullPath);
  }
}
SCAN_DIRECTORIES.forEach((d) => walk(path.join(root, d)));

const chainPattern = /\.from\(\s*["']([a-z_]+)["']\s*\)((?:(?!\.from\(|;|\n\s*\n|\bconst\b|\bawait\b)[\s\S])*)/g;
const selectPattern = /\.select\(\s*(["'])(.*?)\1/s;
const filterPattern = /\.(?:eq|neq|in|order|gte|lte|gt|lt|is|ilike|like|not|contains)\(\s*["']([a-z_]+)["']/g;
const writePattern = /\.(?:insert|update|upsert)\(\s*\{([\s\S]*?)\}\s*[,)]/g;
const keyPattern = /(?:^|[,{\s])([a-z_][a-z0-9_]*)\s*:/g;

function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

const problems = [];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const chain of source.matchAll(chainPattern)) {
    const [, table, body] = chain;
    const columns = columnsByTable.get(table);
    const relative = path.relative(root, file);
    if (!columns) {
      if (!source.includes("storage")) problems.push(`${relative}: unknown table "${table}"`);
      continue;
    }
    const bad = new Set();
    const select = body.match(selectPattern);
    if (select) {
      for (const raw of splitTopLevel(select[2])) {
        const part = raw.trim();
        if (!part || part === "*" || part.includes("(") || part.includes("!")) continue;
        const name = (part.includes(":") ? part.split(":")[1] : part).split("::")[0].split("->")[0].trim();
        if (/^[a-z_][a-z0-9_]*$/.test(name) && !columns.has(name)) bad.add(`select ${name}`);
      }
    }
    for (const filter of body.matchAll(filterPattern)) {
      if (!columns.has(filter[1])) bad.add(`filter ${filter[1]}`);
    }
    for (const write of body.matchAll(writePattern)) {
      for (const key of write[1].matchAll(keyPattern)) {
        if (!columns.has(key[1])) bad.add(`write ${key[1]}`);
      }
    }
    if (bad.size > 0) problems.push(`${relative}: ${table} -> ${[...bad].join(", ")}`);
  }
}

if (problems.length > 0) {
  console.error("Supabase queries reference columns that are not in lib/database.types.ts:");
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log(`Query column validation passed for ${files.length} files.`);
