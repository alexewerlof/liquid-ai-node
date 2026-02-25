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

  on_finalized_text(text) {
    if (!this.hasFirstToken && text.length > 0) {
      this.ttft = performance.now() - this.startTime;
      this.hasFirstToken = true;
    }
    super.on_finalized_text(text);
    this.tokenCount++;
  }
}

/**
 * Initializes the model and returns the generator.
 */
async function init(modelId) {
  console.log(`\nLoading model: ${modelId}...`);
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
    console.log(`Model loaded in ${loadDuration}s. Ready for chat!\n`);
    return generator;
  } catch (error) {
    throw new Error(`Failed to load model "${modelId}": ${error.message}`);
  }
}

/**
 * Generates a completion from the model history and prints performance metrics.
 */
async function getCompletion(generator, messages) {
  // Format prompt using ChatML
  const prompt = messages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';

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
      max_new_tokens: 512,
      temperature: 0.7,
      return_full_text: false,
      streamer: streamer,
    });

    const totalDuration = (performance.now() - inferenceStartTime) / 1000;
    const assistantResponse = results[0].generated_text;
    
    // Calculate Metrics
    const ttftSec = streamer.ttft / 1000;
    const decodeDuration = totalDuration - ttftSec;
    const promptTps = (promptTokens / ttftSec).toFixed(2);
    const decodingTps = (streamer.tokenCount / decodeDuration).toFixed(2);

    const device = generator.device || 'cpu';
    const dtype = generator.model.config.torch_dtype || 'q4';

    console.log(`\n\n--- Performance Metrics ---`);
    console.log(`Device:           ${device.toUpperCase()}`);
    console.log(`Precision:        ${dtype}`);
    console.log(`Prompt Tokens:    ${promptTokens} (${promptTps} tok/s)`);
    console.log(`Generated:        ${streamer.tokenCount} tokens (${decodingTps} tok/s)`);
    console.log(`TTFT:             ${ttftSec.toFixed(3)}s (Prompt processing)`);
    console.log(`Total Time:       ${totalDuration.toFixed(2)}s`);
    console.log(`---------------------------\n`);

    return assistantResponse;
  } catch (error) {
    throw new Error(`\nError during generation: ${error.message}\n`);
  }
}

/**
 * Handles the interactive chat UI.
 */
async function chatUI(generator, systemPromptContent) {
  const rl = readline.createInterface({ input, output });
  const messages = [];

  if (systemPromptContent) {
    messages.push({ role: "system", content: systemPromptContent });
  }

  while (true) {
    const userInput = await rl.question("Prompt: ");

    if (!userInput || userInput.trim() === "") {
      console.log("Empty prompt received. Exiting...");
      break;
    }

    messages.push({ role: "user", content: userInput.trim() });

    const assistantResponse = await getCompletion(generator, messages);
    
    messages.push({ role: "assistant", content: assistantResponse });
  }

  rl.close();
}

/**
 * Main entry point.
 */
async function main() {
  const modelId = "onnx-community/LFM2-1.2B-ONNX";
  const systemPrompt = "You are a helpful and concise AI assistant.";

  try {
    const generator = await init(modelId);
    await chatUI(generator, systemPrompt);
  } catch (error) {
    console.error(`\nCRITICAL ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
