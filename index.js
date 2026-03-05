/**
 * Main entry point for the liquid-ai-node application.
 * This script initializes a Liquid AI model using @huggingface/transformers
 * and starts an interactive chat UI with performance metrics tracking.
 */

import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { inference, systemPrompt, embedding } from './src/config.js'
import { LFMTransformerLLM } from './src/LFMTransformerLLM.js'
import { RAG } from './src/RAG.js'
import { Embedder } from './src/Embedder.js'
import { VectorStore } from './src/VectorStore.js'
import { Session } from './src/Session.js'
import { UserWMsg } from './src/msg/UserWMsg.js'
import { Agent } from './src/Agent.js'
import { Toolbox } from './src/Toolbox.js'
import { ingestFromContentJson } from './src/ingest.js'

/**
 * Checks whether user input is an exit command.
 * @param {string} text - Trimmed user input.
 * @returns {boolean} True if the user wants to exit.
 */
export function isExitCommand(text) {
    return !text || ['exit', 'quit'].includes(text.toLowerCase())
}

/**
 * Main application entry point.
 */
async function main() {
    const huggingFaceToken = process.env.HUGGINGFACE_TOKEN

    console.log('Loading model...')
    console.time(`Init model ${inference.modelId}`)
    const llm = new LFMTransformerLLM()
    await llm.init(inference.modelId, {
        ...inference.options,
        token: huggingFaceToken,
    })
    console.timeEnd(`Init model ${inference.modelId}`)

    // Initialize RAG system
    console.log('Initializing RAG...')
    const embedder = new Embedder()
    await embedder.init(embedding.modelId, embedding.options)

    const vectorStore = new VectorStore()
    const rag = new RAG(embedder, vectorStore)
    await ingestFromContentJson(rag)

    const session = new Session(systemPrompt)
    const rl = readline.createInterface({ input, output })

    while (true) {
        const userInput = (await rl.question('Prompt: ')).trim()

        if (isExitCommand(userInput)) {
            console.log('Exiting chat...')
            break
        }

        // Augment the query with relevant context from the knowledge base
        console.time(`RAG lookup`)
        const augmentedInput = await rag.augmentQuery(userInput)
        console.timeEnd(`RAG lookup`)

        // Pass augmented prompt to model, but store original in history
        const currentMessages = [...session.toMessages(), new UserWMsg(augmentedInput).toJSON()]

        try {
            // Add user message to session directly
            session.addWMsg(new UserWMsg(userInput))

            console.debug('\n[DEBUG] RAG Augmented Input:\n', augmentedInput, '\n')

            process.stdout.write('\nAssistant: ')

            const toolbox = new Toolbox()
            toolbox.addTool('get_time', 'Gets the current local time.').fn(() => new Date().toLocaleTimeString())

            const agent = new Agent(llm, session, toolbox)

            const response = await agent.complete(currentMessages, inference.generation, (token) => {
                process.stdout.write(token)
            })

            // agent.complete() automatically adds the response to the session
            console.log()
        } catch (error) {
            console.error(`Error during chat: ${error.message}`)
        }
    }

    rl.close()
}

main().catch((error) => {
    console.error(`\nCRITICAL ERROR: ${error.message}`)
    process.exit(1)
})
