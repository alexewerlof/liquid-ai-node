/**
 * Global application configuration.
 * Supports environment variable overrides for key settings.
 */
export const CONFIG = Object.freeze({
  // Model ID on Hugging Face
  modelId: "onnx-community/LFM2-1.2B-ONNX",

  // Default system prompt
  systemPrompt: [
    "You are an expert in SRE (Site Reliability Engineering) and DevOps practices",
    "with deep knowledge of terminology and tooling.",
    "When the user asks a question, some relevant context may be added to the context (RAG).",
    "You can use that to answer more accurately but don't refer to the presence of this extra context",
  ].join(" "),

  // Model precision/quantization
  dtype: "q4",

  // Inference parameters
  inference: {
    max_new_tokens: 512,
    temperature: 0.7,
    return_full_text: false,
  },

  // Environment settings
  cacheDir: "./.cache",

  // RAG Configuration
  embeddingModelId: "onnx-community/all-MiniLM-L6-v2-ONNX",
  contentPath: "./content",
});
