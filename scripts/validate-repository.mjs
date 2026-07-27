import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function fail(messages) {
  for (const message of messages) {
    console.error(`::error::${message}`);
  }
  process.exit(1);
}

const tracked = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);

const forbiddenDirectories = new Set([
  "node_modules",
  ".next",
  "out",
  "dist",
  "coverage",
  ".turbo",
  ".vercel",
]);

const forbiddenFiles = tracked.filter((file) => {
  const parts = file.split("/");
  const name = parts.at(-1) ?? file;

  if (parts.some((part) => forbiddenDirectories.has(part))) return true;
  if (file.startsWith("supabase/.temp/")) return true;
  if (/\.tsbuildinfo$/i.test(name)) return true;
  if (/\.(pem|key|p12|pfx)$/i.test(name)) return true;
  if (/\.log$/i.test(name)) return true;

  const isEnvironmentFile = name === ".env" || name.startsWith(".env.");
  const isExample = name === ".env.example" || name.endsWith(".env.example");
  return isEnvironmentFile && !isExample;
});

const errors = [];

if (forbiddenFiles.length > 0) {
  errors.push(`Forbidden generated or environment files are tracked: ${forbiddenFiles.join(", ")}`);
}

if (!existsSync("package-lock.json")) {
  errors.push("package-lock.json is required. Run npm install and commit the generated lockfile.");
}

if (!existsSync(".env.example")) {
  errors.push(".env.example is required for local configuration guidance.");
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

if (!String(packageJson.packageManager || "").startsWith("npm@")) {
  errors.push("package.json must pin the npm package manager version.");
}

for (const script of ["build", "lint", "typecheck", "check:repo", "check:migrations"]) {
  if (!packageJson.scripts?.[script]) {
    errors.push(`package.json is missing the required '${script}' script.`);
  }
}

if (errors.length > 0) fail(errors);

console.log(`Repository hygiene passed for ${tracked.length} tracked files.`);
