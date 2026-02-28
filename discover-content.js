#!/usr/bin/env node

/**
 * Content discovery script (Node-only).
 * Scans the ./content directory for .md files using Node's built-in glob
 * and writes the relative paths to content.json for runtime consumption
 * by both Node and browser environments.
 */

import { glob, writeFile } from "node:fs/promises";

const contentDir = "./content";
const outputFile = "./content.json";

const files = [];
for await (const filePath of glob("**/*.md", { cwd: contentDir })) {
  files.push(filePath);
}

files.sort();
await writeFile(outputFile, JSON.stringify(files, null, 2) + "\n");
console.log(`Discovered ${files.length} markdown files → ${outputFile}`);
