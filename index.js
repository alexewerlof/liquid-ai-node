import { pipeline, env, TextStreamer } from "@huggingface/transformers";
import * as ort from "onnxruntime-node";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Core Mandates from AGENTS.md
env.cacheDir = "./.cache";
env.backends.onnx.runtime = ort;

async function startChat() {
  const modelId = "onnx-community/LFM2-1.2B-ONNX";
  const rl = readline.createInterface({ input, output });
  
  console.log(`Loading model: ${modelId}...`);
  const loadStartTime = performance.now();

  let generator;
  try {
    generator = await pipeline(
      "text-generation",
      modelId,
      {
        dtype: "q4",
        token: process.env.HUGGINGFACE_TOKEN,
      }
    );
    const loadDuration = ((performance.now() - loadStartTime) / 1000).toFixed(2);
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

    // Add user message to history
    messages.push({ role: "user", content: userInput.trim() });

    // Format prompt using ChatML
    const prompt = messages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join('\n') + '\n<|im_start|>assistant\n';

    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
    });

    process.stdout.write("\nAssistant: ");
    const inferenceStartTime = performance.now();

    try {
      const results = await generator(prompt, {
        max_new_tokens: 512,
        temperature: 0.7,
        return_full_text: false,
        streamer: streamer,
      });

      const assistantResponse = results[0].generated_text;
      const inferenceDuration = ((performance.now() - inferenceStartTime) / 1000).toFixed(2);
      
      // Add assistant response to history
      messages.push({ role: "assistant", content: assistantResponse });
      
      console.log(`\n\n[Inference: ${inferenceDuration}s]\n`);
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
