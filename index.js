import { pipeline, env, TextStreamer } from "@huggingface/transformers";
import * as ort from "onnxruntime-node";

// Core Mandates from AGENTS.md
env.cacheDir = "./.cache";
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
        dtype: "q4",
        token: process.env.HUGGINGFACE_TOKEN,
      }
    );

    const loadDuration = ((performance.now() - loadStartTime) / 1000).toFixed(2);
    console.log(`Model loaded in ${loadDuration}s`);

    // Using ChatML format
    const prompt = messages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';

    // Initialize the streamer to print tokens as they are generated
    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
    });

    console.log("Starting inference (streaming mode):\n");
    const inferenceStartTime = performance.now();

    const results = await generator(prompt, {
      max_new_tokens: 128,
      temperature: 0.7,
      return_full_text: false,
      streamer: streamer, // Pass the streamer to the generator
    });

    const inferenceDuration = ((performance.now() - inferenceStartTime) / 1000).toFixed(2);
    console.log(`\n\nInference completed in ${inferenceDuration}s`);

    return results[0].generated_text;
  } catch (error) {
    console.error(`Error during model execution: ${error.message}`);
    throw error;
  }
}

const messages = [
  { role: "user", content: "Explain Site Reliability Engineering in one sentence:" }
];

runLiquidModel(messages).catch(() => process.exit(1));
