/**
 * Main entry point for the liquid-ai-node application.
 * This script initializes a Liquid AI model using @huggingface/transformers 
 * and starts an interactive chat UI with performance metrics tracking.
 */

import { initModel } from "./src/model.js";
import { startChat } from "./src/chat.js";
import { CONFIG } from "./src/config.js";

/**
 * Main application entry point.
 */
async function main() {
  const { modelId, systemPrompt, dtype } = CONFIG;
  const huggingFaceToken = process.env.HUGGINGFACE_TOKEN;

  try {
    const generator = await initModel(modelId, dtype, huggingFaceToken);
    await startChat(generator, systemPrompt);
  } catch (error) {
    console.error(`\nCRITICAL ERROR: ${error.message}`);
    process.exit(1);
  }
}

main();
