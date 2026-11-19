// Pre-launch gate. Run with `npm run check:launch` before pointing lethub.uk at
// a production deployment. Not part of CI, because it is expected to fail
// until the real company details are filled in.

import { readFileSync } from "node:fs";

const problems = [];
const company = readFileSync("lib/companyDetails.ts", "utf8");
for (const match of company.matchAll(/^\s+(\w+): "(\[[^\]]*\])",$/gm)) {
  problems.push(`lib/companyDetails.ts: ${match[1]} is still a placeholder (${match[2]})`);
}

if (/LEGAL_PAGES_REVIEWED = false/.test(company)) {
  problems.push("lib/companyDetails.ts: LEGAL_PAGES_REVIEWED is false — have the legal pages reviewed, then set it to true");
}

if (problems.length > 0) {
  console.error("Launch check failed:");
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
console.log("Launch check passed.");
