import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { streamCompletion } from "./model.js";
import { ingestContent, augmentQuery } from "./rag.js";
import { Embedder } from "./Embedder.js";
import { embedding } from "./config.js";

/**
 * Checks whether user input is an exit command.
 * @param {string} text - Trimmed user input.
 * @returns {boolean} True if the user wants to exit.
 */
export function isExitCommand(text) {
  return !text || ["exit", "quit"].includes(text.toLowerCase());
}

/**
 * Runs the interactive chat loop.
 * Streams tokens to stdout.
 * @param {object} generator - The text-generation pipeline instance.
 * @param {string} [systemPromptContent] - Optional system instructions.
 * @param {object} [generationOptions={}] - Inference generation options (e.g. `{ max_new_tokens: 512, temperature: 0.7 }`).
 * @returns {Promise<void>}
 */
export async function startChat(generator, systemPromptContent, generationOptions = {}) {
  const rl = readline.createInterface({ input, output });
  const messages = [];

  // Initialize RAG system
  console.log("Initializing RAG...");
  const embedder = new Embedder();
  await embedder.init(embedding.modelId, embedding.options);
  await ingestContent(embedder);

  if (systemPromptContent) {
    messages.push({ role: "system", content: systemPromptContent });
  }

  while (true) {
    const userInput = (await rl.question("Prompt: ")).trim();

    if (isExitCommand(userInput)) {
      console.log("Exiting chat...");
      break;
    }

    // Augment the query with relevant context from the knowledge base
    console.time(`RAG lookup`)
    const augmentedInput = await augmentQuery(embedder, userInput);
    console.timeEnd(`RAG lookup`)

    // Pass augmented prompt to model, but store original in history
    messages.push({ role: "user", content: augmentedInput });

    try {
      process.stdout.write("\nAssistant: ");
      let assistantResponse = "";

      await streamCompletion(generator, messages, generationOptions, (text) => {
        process.stdout.write(text);
        assistantResponse += text;
      });

      process.stdout.write("\n");

      // Replace augmented input with original in history for cleaner context
      messages[messages.length - 1].content = userInput;
      messages.push({ role: "assistant", content: assistantResponse });
    } catch (error) {
      console.error(`Error during chat: ${error.message}`);
      // Clean up failed message
      if (messages[messages.length - 1]?.role === "user") messages.pop();
    }
  }

  rl.close();
}
