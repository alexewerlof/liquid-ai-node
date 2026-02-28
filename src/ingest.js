import fs from "node:fs/promises";
import path from "node:path";

/**
 * Loads content files listed in content.json, then chunks and indexes them via the RAG instance.
 * This is Node-specific due to filesystem access. A browser equivalent would use fetch().
 * @param {import('./RAG.js').RAG} rag - The RAG instance to add documents to.
 * @param {string} [contentDir="./content"] - Base directory for content files.
 * @param {string} [contentJsonPath="./content.json"] - Path to the content manifest.
 * @returns {Promise<void>}
 */
export async function ingestFromContentJson(rag, contentDir = "./content", contentJsonPath = "./content.json") {
  console.time(`Ingest content`);

  const json = await fs.readFile(contentJsonPath, "utf-8");
  const files = JSON.parse(json);

  console.log(`Ingesting ${files.length} files from "${contentDir}"...`);

  let totalChunks = 0;
  for (const relativePath of files) {
    const fullPath = path.join(contentDir, relativePath);
    const text = await fs.readFile(fullPath, "utf-8");
    const chunks = await rag.addDocument(text, { filename: relativePath });
    console.log(`  ${relativePath}: ${chunks} chunks`);
    totalChunks += chunks;
  }

  console.log(`Indexed ${totalChunks} chunks from ${files.length} files.`);
  console.timeEnd(`Ingest content`);
}
