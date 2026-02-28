import { inRange, isArr, isInt } from "jty";

/**
 * Calculates cosine similarity between two vectors.
 * Note: This function assumes that both vectors are already L2 normalized.
 * When using transformers.js, ensure you pass \`normalize: true\` to the pipeline options.
 * Because the vectors are normalized, this avoids calculating norms and uses a pure dot product.
 * @param {number[]} v1 - First vector.
 * @param {number[]} v2 - Second vector.
 * @returns {number} Similarity score (0-1).
 */
export function cosineSimilarity(v1, v2) {
  if (v1.length !== v2.length) {
    throw new Error(`Vector length mismatch: ${v1.length} vs ${v2.length}`);
  }

  let dotProduct = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
  }

  return dotProduct;
}

/**
 * Simple in-memory vector database.
 * Portable between Node.js and Browser.
 */
export class VectorStore {
  constructor() {
    this.documents = new Map();
  }

  /**
   * Adds a document and its embedding to the store.
   * @param {string} text - The original text.
   * @param {number[]} embedding - The vector embedding.
   * @param {object} [metadata={}] - Optional metadata (e.g., filename).
   * @returns {boolean} True if added, false if it already existed.
   */
  addDocument(text, embedding, metadata = {}) {
    if (this.documents.has(text)) {
      return false;
    }
    this.documents.set(text, { embedding, metadata });
    return true;
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

    const results = [];
    for (const [text, { embedding, metadata }] of this.documents.entries()) {
      const score = cosineSimilarity(queryEmbedding, embedding);
      if (score >= minScore) {
        results.push({ text, metadata, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    if (results.length > maxResults) {
      results.length = maxResults;
    }

    return results;
  }
}
