/**
 * Simple in-memory vector database with cosine similarity search.
 * This is designed for portability between Node.js and Browser.
 */
export class VectorStore {
  constructor() {
    this.documents = [];
  }

  /**
   * Adds a document and its embedding to the store.
   * @param {string} text - The original text.
   * @param {number[]} embedding - The vector embedding.
   * @param {object} metadata - Optional metadata (e.g., filename).
   */
  addDocument(text, embedding, metadata = {}) {
    this.documents.push({ text, embedding, metadata });
  }

  /**
   * Calculates cosine similarity between two vectors.
   * @param {number[]} v1 - Vector 1.
   * @param {number[]} v2 - Vector 2.
   * @returns {number} Similarity score (0-1).
   */
  cosineSimilarity(v1, v2) {
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
   * Searches for the most similar documents.
   * @param {number[]} queryEmbedding - The embedding of the query.
   * @param {number} topK - Number of results to return.
   * @returns {Array<{text: string, metadata: object, score: number}>}
   */
  search(queryEmbedding, topK = 3) {
    const scores = this.documents.map(doc => ({
      ...doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // Sort by score descending and take top K
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ text, metadata, score }) => ({ text, metadata, score }));
  }
}
