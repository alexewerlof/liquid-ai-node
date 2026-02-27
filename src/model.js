import { TextStreamer } from "@huggingface/transformers";
import { pipeline } from "./runtime.js";
import { isFn, isStr } from "jty";

/**
 * Initializes the text-generation pipeline.
 * @param {string} modelId - Hugging Face model ID.
 * @param {object} [options={}] - Options passed directly to the Transformers.js pipeline (e.g. `{ dtype: "q4", token: "hf_..." }`).
 * @returns {Promise<object>} The pipeline generator instance.
 */
export async function initModel(modelId, options = {}) {
  if (!isStr(modelId)) {
    throw new TypeError(`Expected a string for modelId. Got ${modelId} (${typeof modelId})`);
  }

  try {
    return await pipeline("text-generation", modelId, options);
  } catch (error) {
    throw new Error(`Failed to load model "${modelId}": ${error.message}`);
  }
}


/**
 * Streams completion text from the model, calling `onToken` for each chunk.
 *
 * @param {object} generator - The text-generation pipeline instance.
 * @param {Array<{role: string, content: string}>} messages - ChatML messages.
 * @param {object} [options={}] - Custom generation parameters.
 * @param {function(string): void} onToken - Callback invoked with each text chunk.
 * @returns {Promise<void>}
 */
export async function streamCompletion(generator, messages, options = {}, onToken) {
  if (!isFn(onToken)) {
    throw new TypeError(`Expected a function for onToken. Got ${onToken} (${typeof onToken})`);
  }

  const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: onToken,
  });

  await generator(messages, { ...options, streamer });
}
