import { inRange, isArr, isInt } from "jty";

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} v1 - First vector.
 * @param {number[]} v2 - Second vector.
 * @returns {number} Similarity score (0-1).
 */
export function cosineSimilarity(v1, v2) {
  if (v1.length !== v2.length) {
    throw new Error(`Vector length mismatch: ${v1.length} vs ${v2.length}`);
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Simple in-memory vector database.
 * Portable between Node.js and Browser.
 */
export class VectorStore {
  constructor() {
    this.documents = [];
  }

  /**
   * Adds a document and its embedding to the store.
   * @param {string} text - The original text.
   * @param {number[]} embedding - The vector embedding.
   * @param {object} [metadata={}] - Optional metadata (e.g., filename).
   */
  addDocument(text, embedding, metadata = {}) {
    this.documents.push({ text, embedding, metadata });
  }

  /**
   * Searches for the most similar documents.
   * @param {number[]} queryEmbedding - The embedding of the query.
   * @param {number} minScore - Minimum similarity score (0-1) required for a result to be included.
   * @param {number} maxResults - Maximum number of results to return.
   * @returns {Array<{text: string, metadata: object, score: number}>}
   */
  search(queryEmbedding, minScore, maxResults) {
    if (!isArr(queryEmbedding)) throw new Error("queryEmbedding must be an array");
    if (!inRange(minScore, 0, 1)) throw new Error("minScore must be a number between 0 and 1");
    if (!isInt(maxResults) || maxResults <= 0) throw new Error("maxResults must be a positive integer");

    return this.documents
      .map(doc => ({ ...doc, score: cosineSimilarity(queryEmbedding, doc.embedding) }))
      .filter(doc => doc.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ text, metadata, score }) => ({ text, metadata, score }));
  }
}
