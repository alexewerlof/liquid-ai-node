import fs from "node:fs/promises";
import path from "node:path";
import { VectorStore } from "./VectorStore.js";
import { embedding } from "./config.js";

const vectorStore = new VectorStore();

/**
 * Lists all markdown files in a directory (recursively).
 * @param {string} dir - Root content directory.
 * @returns {Promise<Array<{fullPath: string, relativePath: string}>>}
 */
export async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith(".md"))
    .map(e => {
      const fullPath = path.join(e.parentPath || e.path, e.name);
      return { fullPath, relativePath: path.relative(dir, fullPath) };
    });
}

/**
 * Splits text into chunks by double-newline, keeping only non-empty chunks.
 * @param {string} text - The raw text content.
 * @param {number} [minLength=0] - Minimum character length for a chunk.
 * @returns {string[]} Non-empty chunks.
 */
export function chunkText(text, minLength = 0) {
  return text
    .split(/\n\n+/)
    .map((c) => c.trim())
    .filter((c) => c.length > minLength);
}

/**
 * Loads markdown files from a directory, chunks them, and indexes them in the vector store.
 * @param {import('./Embedder.js').Embedder} embedder - The embedder instance.
 * @param {string} [contentDir] - Path to the content directory.
 * @returns {Promise<void>}
 */
export async function ingestContent(embedder, contentDir = embedding.contentPath) {
  try {
    console.time(`Ingest content ${contentDir}`)
    const files = await listMarkdownFiles(contentDir);
    console.log(`Ingesting ${files.length} files from "${contentDir}" into RAG context...`);

    for (const { fullPath, relativePath } of files) {
      const content = await fs.readFile(fullPath, "utf-8");
      const chunks = chunkText(content);
      console.log(`Processing file: ${relativePath} - ${chunks.length} chunks`);

      for (const chunk of chunks) {
        const embedding = await embedder.embed(chunk);
        vectorStore.addDocument(chunk, embedding, { filename: relativePath });
      }
    }

    console.log(`Successfully indexed all knowledge base files from "${contentDir}".`);
    console.timeEnd(`Ingest content ${contentDir}`)
  } catch (error) {
    console.error(`Error during RAG ingestion: ${error.message}`);
    if (error.code !== "ENOENT") throw error;
  }
}

/**
 * Retrieves the most relevant context for a user query.
 * @param {import('./Embedder.js').Embedder} embedder - The embedder instance.
 * @param {string} query - The user query.
 * @param {number} [minScore] - Minimum similarity score (0-1) required for a result to be included.
 * @param {number} [maxResults] - Maximum number of results to return.
 * @returns {Promise<string>} Concatenated context string, or empty string if no results.
 */
export async function getRelevantContext(embedder, query, minScore = 0.3, maxResults = 3) {
  const queryEmbedding = await embedder.embed(query);
  const results = vectorStore.search(queryEmbedding, minScore, maxResults);

  console.log(`RAG found ${results.length} items. Similarity: ${results.map(r => r.score).join(", ")}.`);

  if (results.length === 0) return "";
  return results.map(result => `[Source: ${result.metadata.filename}]\n${result.text}`).join("\n\n");
}

/**
 * Augments a user query with retrieved context from the knowledge base.
 * @param {import('./Embedder.js').Embedder} embedder - The embedder instance.
 * @param {string} query - The user query.
 * @returns {Promise<string>} The augmented prompt, or original query if no context found.
 */
export async function augmentQuery(embedder, query) {
  const context = await getRelevantContext(embedder, query);
  if (!context) return query;

  return [
    "### Context from Knowledge Base:",
    context,
    "### User Question:",
    query,
    "Please answer the user's question accurately using only the provided context above. If the context doesn't contain the answer, say you don't know."
  ].join("\n");
}
