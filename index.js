/**
 * Main entry point for the liquid-ai-node application.
 * This script initializes a Liquid AI model using @huggingface/transformers 
 * and starts an interactive chat UI with performance metrics tracking.
 */

import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { inference, systemPrompt, embedding } from "./src/config.js";
import { TransformerLLM } from "./src/TransformersLLM.js";
import { RAG } from "./src/RAG.js";
import { Embedder } from "./src/Embedder.js";
import { VectorStore } from "./src/VectorStore.js";
import { Session, userMessage, assistantMessage } from "./src/Session.js";
import { ingestFromContentJson } from "./src/ingest.js";

/**
 * Checks whether user input is an exit command.
 * @param {string} text - Trimmed user input.
 * @returns {boolean} True if the user wants to exit.
 */
export function isExitCommand(text) {
  return !text || ["exit", "quit"].includes(text.toLowerCase());
}

/**
 * Main application entry point.
 */
async function main() {
  const huggingFaceToken = process.env.HUGGINGFACE_TOKEN;
  
  console.log('Loading model...');
  console.time(`Init model ${inference.modelId}`);
  const llm = new TransformerLLM();
  await llm.init(inference.modelId, { ...inference.options, token: huggingFaceToken });
  console.timeEnd(`Init model ${inference.modelId}`);

  // Initialize RAG system
  console.log("Initializing RAG...");
  const embedder = new Embedder();
  await embedder.init(embedding.modelId, embedding.options);

  const vectorStore = new VectorStore();
  const rag = new RAG(embedder, vectorStore);
  await ingestFromContentJson(rag);

  const session = new Session(systemPrompt);
  const rl = readline.createInterface({ input, output });

  while (true) {
    const userInput = (await rl.question("Prompt: ")).trim();

    if (isExitCommand(userInput)) {
      console.log("Exiting chat...");
      break;
    }

    // Augment the query with relevant context from the knowledge base
    console.time(`RAG lookup`);
    const augmentedInput = await rag.augmentQuery(userInput);
    console.timeEnd(`RAG lookup`);

    // Pass augmented prompt to model, but store original in history
    const currentMessages = [...session.messages, userMessage(augmentedInput)];

    try {
      process.stdout.write("\nAssistant: ");

      let assistantResponse = await llm.complete(currentMessages, inference.generation, (text) => {
        process.stdout.write(text);
      });

      process.stdout.write("\n");

      session.addMessage(userMessage(userInput));
      session.addMessage(assistantMessage(assistantResponse));
    } catch (error) {
      console.error(`Error during chat: ${error.message}`);
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error(`\nCRITICAL ERROR: ${error.message}`);
  process.exit(1);
});
