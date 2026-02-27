import { pipeline } from "./runtime.js";
import { isStr } from "jty";

/**
 * Manages the embedding model lifecycle and generates embeddings.
 * Wraps the Transformers.js feature-extraction pipeline with lazy initialization.
 */
export class Embedder {
  #pipeline = null;

  /**
   * Initializes the embedding pipeline. Safe to call multiple times — returns cached pipeline.
   * @param {string} modelId - Hugging Face model ID for embeddings.
   * @param {object} [options={}] - Options passed directly to the Transformers.js pipeline (e.g. `{ dtype: "fp32" }`).
   * @returns {Promise<object>} The feature-extraction pipeline instance.
   */
  async init(modelId, options = {}) {
    if (this.#pipeline) return this.#pipeline;

    if (!isStr(modelId)) {
      throw new TypeError(`Expected string for modelId, but got ${modelId} (${typeof modelId})`);
    }
    
    try {
      console.time(`Init embedder ${modelId}`)
      this.#pipeline = await pipeline("feature-extraction", modelId, options);
      console.timeEnd(`Init embedder ${modelId}`)
      return this.#pipeline;
    } catch (error) {
      throw new Error(`Failed to load embedding model "${modelId}": ${error.message}`);
    }
  }

  /**
   * Generates an embedding vector for the given text.
   * The pipeline must be initialized via `init()` before calling this method.
   * @param {string} text - The input text to embed.
   * @returns {Promise<number[]>} The embedding vector.
   */
  async embed(text) {
    if (!this.#pipeline) {
      throw new Error("Embedder not initialized. Call init(modelId, options) first.");
    }

    const snippet = text.slice(0, 15);
    const logMsg = `${snippet}... (${text.length} chars)`;
    console.time(logMsg);
    const output = await this.#pipeline(text, {
      pooling: "mean",
      normalize: true,
    });
    console.timeEnd(logMsg);

    return Array.from(output.data);
  }
}
