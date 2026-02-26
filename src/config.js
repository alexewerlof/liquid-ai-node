/**
 * Global application configuration.
 * Supports environment variable overrides for key settings.
 */
export const CONFIG = {
  // Model ID on Hugging Face
  modelId: process.env.MODEL_ID || "onnx-community/LFM2-1.2B-ONNX",

  // Default system prompt
  systemPrompt: process.env.SYSTEM_PROMPT || [
    "You are an expert in SRE (Site Reliability Engineering) and DevOps practices",
    "with deep knowledge of terminology and tooling.",
    "When the user asks a question, some relevant context may be added to the context (RAG).",
    "You can use that to answer more accurately but don't refer to the presence of this extra context",
  ].join(" "),

  // Model precision/quantization
  dtype: process.env.DTYPE || "q4",

  // Inference parameters
  inference: {
    max_new_tokens: parseInt(process.env.MAX_NEW_TOKENS) || 512,
    temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
    return_full_text: false,
  },

  // Environment settings
  cacheDir: process.env.CACHE_DIR || "./.cache",

  // RAG Configuration
  embeddingModelId: process.env.EMBEDDING_MODEL_ID || "onnx-community/all-MiniLM-L6-v2-ONNX",
  contentPath: process.env.CONTENT_PATH || "./content",
};
