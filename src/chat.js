import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getCompletion } from "./model.js";

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

  if (systemPromptContent) {
    messages.push({ role: "system", content: systemPromptContent });
  }

  while (true) {
    const userInput = (await rl.question("Prompt: ")).trim();

    if (!userInput || ["exit", "quit"].includes(userInput.toLowerCase())) {
      console.log("Exiting chat...");
      break;
    }

    messages.push({ role: "user", content: userInput });

    try {
      const assistantResponse = await getCompletion(generator, messages);
      messages.push({ role: "assistant", content: assistantResponse });
    } catch (error) {
      console.error(`Error during chat: ${error.message}`);
      // Continue to the next turn or handle error appropriately.
    }
  }

  rl.close();
}
