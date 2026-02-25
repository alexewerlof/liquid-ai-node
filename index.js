import { pipeline, env } from "@huggingface/transformers";
import * as ort from "onnxruntime-node";

// Core Mandates from AGENTS.md
// 1. Explicitly configure caching for reliability
env.cacheDir = "./.cache";

// 2. Idiomatic way to override the ONNX Runtime backend in Transformers.js v3
env.backends.onnx.runtime = ort;

async function runLiquidModel(messages) {
  const modelId = "onnx-community/LFM2-1.2B-ONNX";
  
  console.log(`Starting to load model: ${modelId}`);
  const loadStartTime = performance.now();

  try {
    const generator = await pipeline(
      "text-generation",
      modelId,
      {
        dtype: "q4", // Prioritize q4 for performance as per research
        token: process.env.HUGGINGFACE_TOKEN,
      }
    );

    const loadDuration = ((performance.now() - loadStartTime) / 1000).toFixed(2);
    console.log(`Model loaded in ${loadDuration}s`);

    // Using ChatML format for LFM models
    const prompt = messages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';

    console.log("Starting inference...");
    const inferenceStartTime = performance.now();

    const results = await generator(prompt, {
      max_new_tokens: 128,
      temperature: 0.7,
      return_full_text: false,
    });

    const inferenceDuration = ((performance.now() - inferenceStartTime) / 1000).toFixed(2);
    console.log(`Inference completed in ${inferenceDuration}s`);

    return results[0].generated_text;
  } catch (error) {
    console.error(`Error during model execution: ${error.message}`);
    console.error("Possible fixes:");
    console.error("1. Ensure HUGGINGFACE_TOKEN in .env is valid.");
    console.error("2. Ensure you have accepted the model license on Hugging Face.");
    console.error("3. Check if you have enough disk space and RAM.");
    throw error;
  }
}

const messages = [
  { role: "user", content: "Explain Site Reliability Engineering in one sentence:" }
];

runLiquidModel(messages)
  .then((response) => {
    console.log("\nResponse:");
    console.log(response);
  })
  .catch((err) => {
    // Error is already logged in runLiquidModel
    process.exit(1);
  });
