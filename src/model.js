import { pipeline, env } from "@huggingface/transformers";
import * as ort from "onnxruntime-node";
import { MetricsStreamer } from "./metrics.js";
import { CONFIG } from "./config.js";

// Apply global configurations
env.cacheDir = CONFIG.cacheDir;
env.backends.onnx.runtime = ort;

/**
 * Initializes the model and returns the generator.
 * @param {string} modelId - Hugging Face model ID.
 * @param {string} dtype - Precision/quantization for the model.
 * @param {string|null} token - Hugging Face token.
 */
export async function initModel(modelId = CONFIG.modelId, dtype = CONFIG.dtype, token = null) {
  console.log(`\nLoading model: ${modelId}...`);
  const loadStartTime = performance.now();

  try {
    const generator = await pipeline(
      "text-generation",
      modelId,
      {
        dtype: dtype,
        token: token,
      }
    );
    const loadDuration = ((performance.now() - loadStartTime) / 1000).toFixed(2);
    console.log(`Model loaded in ${loadDuration}s. Ready for chat!\n`);
    return generator;
  } catch (error) {
    throw new Error(`Failed to load model "${modelId}": ${error.message}`);
  }
}

/**
 * Formats a list of messages into a ChatML prompt string.
 * @param {Array<{role: string, content: string}>} messages - List of ChatML messages.
 * @returns {string} The formatted prompt string.
 */
export function formatPrompt(messages) {
  return messages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';
}

/**
 * Generates a completion from the model history and prints performance metrics.
 * @param {any} generator - The text-generation pipeline instance.
 * @param {Array<{role: string, content: string}>} messages - List of ChatML messages.
 * @param {object} [options={}] - Custom inference parameters.
 * @returns {Promise<string>} The assistant's response.
 */
export async function getCompletion(generator, messages, options = {}) {
  // Merge user options with defaults from config
  const inferenceOptions = {
    ...CONFIG.inference,
    ...options,
  };

  // Format prompt using ChatML
  const prompt = formatPrompt(messages);

  // Calculate prompt tokens
  const { input_ids } = await generator.tokenizer(prompt);
  const promptTokens = input_ids.size;

  const streamer = new MetricsStreamer(generator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
  });

  process.stdout.write("\nAssistant: ");
  const inferenceStartTime = performance.now();
  streamer.startTime = inferenceStartTime;

  try {
    const results = await generator(prompt, {
      ...inferenceOptions,
      streamer: streamer,
    });

    const totalDuration = (performance.now() - inferenceStartTime) / 1000;
    const assistantResponse = results[0].generated_text;

    // Performance Metrics
    const device = generator.device || 'cpu';
    const dtype = generator.model.config.torch_dtype || CONFIG.dtype;
    streamer.logMetrics(totalDuration, promptTokens, device, dtype);

    return assistantResponse;
  } catch (error) {
    throw new Error(`\nError during generation: ${error.message}\n`);
  }
}
