import { isStr, isA } from "jty";
import { VectorStore } from "./VectorStore.js";
import { Embedder } from "./Embedder.js";

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
 * Portable RAG (Retrieval-Augmented Generation) engine.
 * Works in both Node.js and browser environments.
 * Handles chunking, embedding, and context retrieval.
 */
export class RAG {
  #embedder;
  #vectorStore;

  /**
   * @param {Embedder} embedder - Initialized embedder instance.
   * @param {VectorStore} vectorStore - Vector store for document storage and search.
   */
  constructor(embedder, vectorStore) {
    if (!isA(embedder, Embedder)) {
      throw new TypeError(`Expected Embedder instance for embedder, but got ${embedder} (${typeof embedder})`);
    }
    if (!isA(vectorStore, VectorStore)) {
      throw new TypeError(`Expected VectorStore instance for vectorStore, but got ${vectorStore} (${typeof vectorStore})`);
    }

    this.#embedder = embedder;
    this.#vectorStore = vectorStore;
  }

  /**
   * Chunks text, embeds each chunk, and adds them to the vector store.
   * @param {string} text - The document text to add.
   * @param {object} [metadata={}] - Optional metadata (e.g., { filename: "intro.md" }).
   * @returns {Promise<number>} The number of chunks indexed.
   */
  async addDocument(text, metadata = {}) {
    if (!isStr(text)) {
      throw new TypeError(`Expected string for text, but got ${text} (${typeof text})`);
    }

    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const embedding = await this.#embedder.embed(chunk);
      this.#vectorStore.addDocument(chunk, embedding, metadata);
    }
    return chunks.length;
  }

  /**
   * Retrieves the most relevant context for a user query.
   * @param {string} query - The user query.
   * @param {number} [minScore=0.3] - Minimum similarity score (0-1).
   * @param {number} [maxResults=3] - Maximum number of results.
   * @returns {Promise<string>} Concatenated context string, or empty string if no results.
   */
  async getRelevantContext(query, minScore = 0.3, maxResults = 3) {
    const queryEmbedding = await this.#embedder.embed(query);
    const results = this.#vectorStore.search(queryEmbedding, minScore, maxResults);

    console.log(`RAG found ${results.length} items. Similarity: ${results.map(r => r.score).join(", ")}.`);

    if (results.length === 0) return "";
    return results.map(result => `[Source: ${result.metadata.filename}]\n${result.text}`).join("\n\n");
  }

  /**
   * Augments a user query with retrieved context from the knowledge base.
   * @param {string} query - The user query.
   * @returns {Promise<string>} The augmented prompt, or original query if no context found.
   */
  async augmentQuery(query) {
    const context = await this.getRelevantContext(query);
    if (!context) return query;

    return [
      "### Context from Knowledge Base:",
      context,
      "### User Question:",
      query,
      "Please answer the user's question accurately using only the provided context above. If the context doesn't contain the answer, say you don't know."
    ].join("\n");
  }
}
