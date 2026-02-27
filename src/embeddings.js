import { pipeline, env } from "@huggingface/transformers";
import * as ort from "onnxruntime-node";
import { embedding, cacheDir } from "./config.js";

// Apply global configurations
env.cacheDir = cacheDir;
env.backends.onnx.runtime = ort;

let embeddingPipeline = null;

/**
 * Initializes the embedding model.
 * @param {string} modelId - Hugging Face model ID for embeddings.
 */
export async function initEmbeddingModel(modelId = embedding.modelId) {
  if (embeddingPipeline) return embeddingPipeline;

  console.log(`Loading embedding model: ${modelId}...`);
  const start = performance.now();
  
  try {
    embeddingPipeline = await pipeline("feature-extraction", modelId, {
      dtype: embedding.dtype,
    });
    const duration = ((performance.now() - start) / 1000).toFixed(2);
    console.log(`Embedding model loaded in ${duration}s.
`);
    return embeddingPipeline;
  } catch (error) {
    throw new Error(`Failed to load embedding model "${modelId}": ${error.message}`);
  }
}

/**
 * Generates an embedding for a given text.
 * @param {string} text - The input text to embed.
 * @returns {Promise<number[]>} The embedding vector.
 */
export async function generateEmbedding(text) {
  if (!embeddingPipeline) {
    await initEmbeddingModel();
  }

  // Generate features
  const output = await embeddingPipeline(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Extract the data from the tensor (first batch, first sequence if applicable)
  return Array.from(output.data);
}
