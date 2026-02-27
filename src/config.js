/**
 * Global application configuration.
 * Supports environment variable overrides for key settings.
 */

// Shared settings
export const cacheDir = "./.cache";

// Default system prompt
export const systemPrompt = [
  "You are an expert in SRE (Site Reliability Engineering) and DevOps practices",
  "with deep knowledge of terminology and tooling.",
  "When the user asks a question, some relevant context may be added to the context (RAG).",
  "You can use that to answer more accurately but don't refer to the presence of this extra context",
].join(" ");

// Inference model configuration (text-generation)
export const inference = Object.freeze({
  modelId: "onnx-community/LFM2-1.2B-ONNX",
  dtype: "q4",
  generation: Object.freeze({
    max_new_tokens: 512,
    temperature: 0.7,
    return_full_text: false,
  }),
});

// Embedding model configuration (RAG)
export const embedding = Object.freeze({
  modelId: "onnx-community/all-MiniLM-L6-v2-ONNX",
  dtype: "fp32",
  contentPath: "./content",
});
