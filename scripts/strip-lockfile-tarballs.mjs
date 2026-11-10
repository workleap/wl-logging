// pnpm writes a "tarball: https://registry.npmjs.org/..." URL into pnpm-lock.yaml for every package it resolves
// through the GitHub package firewall, because the firewall metadata points tarballs at npm. Frozen installs then
// download those tarballs directly from npm and bypass the firewall. Without a tarball URL, pnpm downloads through
// the registry configured in the repository .npmrc (the firewall).

import { readFileSync, writeFileSync } from "node:fs";

// Matches the same URLs as the "Check that the lockfile downloads through the package firewall" CI step.
const npmTarballUrl = "tarball: https://registry.npmjs.org/";

const lockfilePath = new URL("../pnpm-lock.yaml", import.meta.url);
const lockfile = readFileSync(lockfilePath, "utf8");

// A tarball URL can only be removed when the resolution also has an integrity, e.g.
// "{integrity: sha512-..., tarball: https://registry.npmjs.org/...}" becomes "{integrity: sha512-...}".
const stripped = lockfile.replaceAll(/, tarball: https:\/\/registry\.npmjs\.org\/[^,}]*/g, "");

if (stripped !== lockfile) {
    writeFileSync(lockfilePath, stripped);
    console.log("Stripped the registry.npmjs.org tarball URLs from pnpm-lock.yaml.");
} else {
    console.log("pnpm-lock.yaml has no strippable registry.npmjs.org tarball URLs.");
}

const remaining = stripped.split("\n").filter(line => line.includes(npmTarballUrl));

if (remaining.length > 0) {
    console.error(`pnpm-lock.yaml still has ${remaining.length} registry.npmjs.org tarball URL(s) without an integrity, which can't be stripped safely:`);
    remaining.forEach(line => console.error(`  ${line.trim()}`));
    process.exitCode = 1;
}
