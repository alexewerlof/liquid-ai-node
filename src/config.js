/**
 * Global application configuration.
 * Supports environment variable overrides for key settings.
 */
export const CONFIG = {
  // Model ID on Hugging Face
  modelId: process.env.MODEL_ID || "onnx-community/LFM2-1.2B-ONNX",

  // Default system prompt
  systemPrompt: process.env.SYSTEM_PROMPT || "You are a helpful and concise AI assistant.",

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
};
