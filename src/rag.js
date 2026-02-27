import fs from "node:fs/promises";
import path from "node:path";
import { initEmbeddingModel, generateEmbedding } from "./embeddings.js";
import { VectorStore } from "./vector_store.js";
import { embedding } from "./config.js";

const vectorStore = new VectorStore();

/**
 * Loads markdown files from a directory and its subdirectories and indexes them in the vector store.
 * @param {string} contentDir - Path to the content directory.
 */
export async function ingestContent(contentDir = embedding.contentPath) {
  try {
    // Get all entries recursively. withFileTypes: true allows checking if an entry is a file.
    const entries = await fs.readdir(contentDir, { recursive: true, withFileTypes: true });
    
    // Filter for markdown files only
    const markdownFiles = entries.filter(entry => 
      entry.isFile() && entry.name.endsWith('.md')
    );

    console.log(`Ingesting ${markdownFiles.length} files from "${contentDir}" (including subdirectories) into RAG context...`);

    for (const entry of markdownFiles) {
      // entry.parentPath is available in newer Node versions, or we can use path.join(entry.path, entry.name)
      // For Node 22, entry.parentPath (or entry.path in some versions) is used.
      const fullPath = path.join(entry.parentPath || entry.path, entry.name);
      const relativePath = path.relative(contentDir, fullPath);
      const content = await fs.readFile(fullPath, 'utf-8');

      // Simple chunking strategy for markdown: split by double newline (paragraphs/sections)
      const chunks = content.split(/\n\n+/).filter(c => c.trim().length > 50);
      console.log(`Processing file: ${relativePath} - ${chunks.length} chunks`);

      for (const chunk of chunks) {
        const logMsg = `${chunk.slice(0, 15)} (${chunk.length} chars)`;
        console.time(logMsg);
        const embedding = await generateEmbedding(chunk);
        console.timeEnd(logMsg);
        vectorStore.addDocument(chunk, embedding, { filename: relativePath });
      }
    }

    console.log(`Successfully indexed all knowledge base files from "${contentDir}".`);
  } catch (error) {
    console.error(`Error during RAG ingestion: ${error.message}`);
    if (error.code !== 'ENOENT') throw error;
  }
}

/**
 * Retrieves the most relevant context for a user query.
 * @param {string} query - The user query.
 * @param {number} [topK=3] - Number of results to return.
 * @returns {Promise<string>} The concatenated context string.
 */
export async function getRelevantContext(query, topK = 3) {
  const queryEmbedding = await generateEmbedding(query);
  const results = vectorStore.search(queryEmbedding, topK);

  if (results.length === 0) return "";

  // Concatenate context with clear markers
  return results.map(r => `[Source: ${r.metadata.filename}]\n${r.text}`).join('\n\n');
}

/**
 * Augments a user query with retrieved context.
 * @param {string} query - The user query.
 * @returns {Promise<string>} The augmented prompt.
 */
export async function augmentQuery(query) {
  const context = await getRelevantContext(query);
  if (!context) return query;

  return [
    "### Context from Knowledge Base:",
    context,
    "### User Question:",
    query,
    "Please answer the user's question accurately using only the provided context above. If the context doesn't contain the answer, say you don't know."
  ].join("\n");
}
