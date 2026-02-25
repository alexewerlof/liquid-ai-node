import { pipeline, env, TextStreamer } from "@huggingface/transformers";
import * as ort from "onnxruntime-node";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Core Mandates from AGENTS.md
env.cacheDir = "./.cache";
env.backends.onnx.runtime = ort;

/**
 * Custom streamer to track performance metrics
 */
class MetricsStreamer extends TextStreamer {
  constructor(tokenizer, options) {
    super(tokenizer, options);
    this.startTime = 0;
    this.ttft = 0; // Time To First Token
    this.tokenCount = 0;
    this.hasFirstToken = false;
  }

  // Override to detect first token
  on_finalized_text(text) {
    if (!this.hasFirstToken && text.length > 0) {
      this.ttft = performance.now() - this.startTime;
      this.hasFirstToken = true;
    }
    super.on_finalized_text(text);
    this.tokenCount++;
  }
}

async function startChat() {
  const modelId = "onnx-community/LFM2-1.2B-ONNX";
  const rl = readline.createInterface({ input, output });
  
  console.log(`\nLoading model: ${modelId}...`);
  const loadStartTime = performance.now();

  let generator;
  let loadDuration;
  try {
    generator = await pipeline(
      "text-generation",
      modelId,
      {
        dtype: "q4",
        token: process.env.HUGGINGFACE_TOKEN,
      }
    );
    loadDuration = ((performance.now() - loadStartTime) / 1000).toFixed(2);
    console.log(`Model loaded in ${loadDuration}s\n`);
  } catch (error) {
    console.error(`Failed to load model: ${error.message}`);
    rl.close();
    process.exit(1);
  }

  const messages = [];

  while (true) {
    const userInput = await rl.question("Prompt: ");

    if (!userInput || userInput.trim() === "") {
      console.log("Empty prompt received. Exiting...");
      break;
    }

    messages.push({ role: "user", content: userInput.trim() });

    // Format prompt using ChatML
    const prompt = messages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';

    // Calculate prompt tokens correctly
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
        max_new_tokens: 512,
        temperature: 0.7,
        return_full_text: false,
        streamer: streamer,
      });

      const inferenceEndTime = performance.now();
      const totalDuration = (inferenceEndTime - inferenceStartTime) / 1000;
      const assistantResponse = results[0].generated_text;
      
      messages.push({ role: "assistant", content: assistantResponse });
      
      // Calculate Metrics
      const ttftSec = streamer.ttft / 1000;
      const decodeDuration = totalDuration - ttftSec;
      const promptTps = (promptTokens / ttftSec).toFixed(2);
      const decodingTps = (streamer.tokenCount / decodeDuration).toFixed(2);

      // Get technical settings
      const device = generator.device || 'cpu';
      const dtype = generator.model.config.torch_dtype || 'q4';

      console.log(`\n\n--- Performance Metrics ---`);
      console.log(`Model Load Time:  ${loadDuration}s`);
      console.log(`Device:           ${device.toUpperCase()}`);
      console.log(`Precision:        ${dtype}`);
      console.log(`Prompt Tokens:    ${promptTokens} (${promptTps} tok/s)`);
      console.log(`Generated:        ${streamer.tokenCount} tokens (${decodingTps} tok/s)`);
      console.log(`TTFT:             ${ttftSec.toFixed(3)}s (Prompt processing)`);
      console.log(`Total Time:       ${totalDuration.toFixed(2)}s`);
      console.log(`---------------------------\n`);

    } catch (error) {
      console.error(`\nError during generation: ${error.message}\n`);
    }
  }

  rl.close();
}

startChat().catch((err) => {
  console.error("Critical error:", err);
  process.exit(1);
});
