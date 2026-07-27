import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const migrationDirectory = path.join(process.cwd(), "supabase", "migrations");
const files = readdirSync(migrationDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const errors = [];
const parsed = [];
const seenNumbers = new Set();

for (const file of files) {
  const match = /^(\d{3})_([a-z0-9_]+)\.sql$/.exec(file);
  if (!match) {
    errors.push(`${file} must use the format NNN_lower_snake_case.sql.`);
    continue;
  }

  const number = Number(match[1]);
  if (seenNumbers.has(number)) {
    errors.push(`Migration number ${match[1]} is duplicated.`);
  }
  seenNumbers.add(number);
  parsed.push({ file, number });

  const sql = readFileSync(path.join(migrationDirectory, file), "utf8");
  if (sql.trim().length === 0) {
    errors.push(`${file} is empty.`);
  }
  if (!sql.includes(";")) {
    errors.push(`${file} does not contain a complete SQL statement.`);
  }
  if (/^(<<<<<<<|=======|>>>>>>>)/m.test(sql)) {
    errors.push(`${file} contains unresolved merge markers.`);
  }
}

parsed.sort((left, right) => left.number - right.number);

if (parsed.length === 0) {
  errors.push("No Supabase migrations were found.");
} else {
  if (parsed[0].number !== 1) {
    errors.push(`Migration history must start at 001, found ${String(parsed[0].number).padStart(3, "0")}.`);
  }

  for (let index = 1; index < parsed.length; index += 1) {
    const expected = parsed[index - 1].number + 1;
    if (parsed[index].number !== expected) {
      errors.push(
        `Migration sequence has a gap: expected ${String(expected).padStart(3, "0")} before ${parsed[index].file}.`,
      );
    }
  }

  const lexicalOrder = files.filter((file) => /^\d{3}_[a-z0-9_]+\.sql$/.test(file));
  const numericOrder = parsed.map(({ file }) => file);
  if (lexicalOrder.join("\n") !== numericOrder.join("\n")) {
    errors.push("Migration filenames do not sort in execution order.");
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`::error::${error}`);
  process.exit(1);
}

console.log(
  `Migration validation passed: ${parsed.length} files, 001-${String(parsed.at(-1).number).padStart(3, "0")}.`,
);
