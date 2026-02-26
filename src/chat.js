import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getCompletion } from "./model.js";
import { ingestContent, augmentQuery } from "./rag.js";
import { initEmbeddingModel } from "./embeddings.js";

/**
 * Handles the interactive chat UI loop.
 * Continues to prompt the user for input until an exit command is given.
 * @param {any} generator - The model generator instance.
 * @param {string} [systemPromptContent] - Optional system instructions for the model.
 * @returns {Promise<void>}
 */
export async function startChat(generator, systemPromptContent) {
  const rl = readline.createInterface({ input, output });
  const messages = [];

  // Initialize RAG system
  console.log("--- Initializing RAG System ---");
  await initEmbeddingModel();
  await ingestContent();

  if (systemPromptContent) {
    messages.push({ role: "system", content: systemPromptContent });
  }

  while (true) {
    const userInput = (await rl.question("Prompt: ")).trim();

    if (!userInput || ["exit", "quit"].includes(userInput.toLowerCase())) {
      console.log("Exiting chat...");
      break;
    }

    // Augment the query with relevant context from the knowledge base
    const augmentedInput = await augmentQuery(userInput);
    
    // Add original user input to history, but pass augmented prompt to model
    messages.push({ role: "user", content: augmentedInput });

    try {
      const assistantResponse = await getCompletion(generator, messages);
      // Replace augmented input with user input in history for cleaner chat
      messages[messages.length - 1].content = userInput;
      messages.push({ role: "assistant", content: assistantResponse });
    } catch (error) {
      console.error(`Error during chat: ${error.message}`);
      // Clean up failed message
      if (messages[messages.length - 1].role === "user") messages.pop();
    }
  }

  rl.close();
}
