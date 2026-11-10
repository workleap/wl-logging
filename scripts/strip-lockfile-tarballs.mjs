// pnpm writes a "tarball: https://registry.npmjs.org/..." URL into pnpm-lock.yaml for every package it resolves
// through the GitHub package firewall, because the firewall metadata points tarballs at npm. Frozen installs then
// download those tarballs directly from npm and bypass the firewall. Without a tarball URL, pnpm downloads through
// the registry configured in the repository .npmrc (the firewall).

import { readFileSync, writeFileSync } from "node:fs";

const lockfilePath = new URL("../pnpm-lock.yaml", import.meta.url);
const lockfile = readFileSync(lockfilePath, "utf8");
const stripped = lockfile.replaceAll(/, tarball: https:\/\/registry\.npmjs\.org\/[^}]*\}/g, "}");

if (stripped === lockfile) {
    console.log("pnpm-lock.yaml has no registry.npmjs.org tarball URLs.");
} else {
    writeFileSync(lockfilePath, stripped);
    console.log("Stripped the registry.npmjs.org tarball URLs from pnpm-lock.yaml.");
}
