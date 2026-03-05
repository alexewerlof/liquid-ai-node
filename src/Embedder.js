import { isStr } from 'jty'
import { createPipeline } from './runtime.js'

/**
 * Manages the embedding model lifecycle and generates embeddings.
 * Wraps the Transformers.js feature-extraction pipeline with lazy initialization.
 */
export class Embedder {
    #pipeline = null
    #modelId = null
    #pipelineOptions = null

    /**
     * Creates a new Embedder instance.
     * @param {string} modelId - Hugging Face model ID for embeddings.
     * @param {object} [pipelineOptions={}] - Options passed directly to the Transformers.js pipeline (e.g. `{ dtype: "fp32" }`).
     */
    constructor(modelId, pipelineOptions = {}) {
        if (!isStr(modelId)) {
            throw new TypeError(`Expected string for modelId, but got ${modelId} (${typeof modelId})`)
        }
        this.#modelId = modelId
        this.#pipelineOptions = pipelineOptions
    }

    /**
     * Initializes the embedding pipeline. Safe to call multiple times — returns cached pipeline.
     * @returns {Promise<Embedder>} Returns `this` instance for chaining.
     */
    async load() {
        if (this.#pipeline) return this

        try {
            console.time(`Init embedder ${this.#modelId}`)
            this.#pipeline = await createPipeline('feature-extraction', this.#modelId, this.#pipelineOptions)
            console.timeEnd(`Init embedder ${this.#modelId}`)
            return this
        } catch (error) {
            throw new Error(`Failed to load embedding model "${this.#modelId}": ${error.message}`, { cause: error })
        }
    }

    /**
     * Unloads the embedding model from memory and clears the cache.
     */
    async unload() {
        if (this.#pipeline) {
            await this.#pipeline.dispose()
            this.#pipeline = null
        }
    }

    /**
     * Generates an embedding vector for the given text.
     * The pipeline must be initialized via `load()` before calling this method.
     * @param {string} text - The input text to embed.
     * @returns {Promise<number[]>} The embedding vector.
     */
    async embed(text) {
        if (!this.#pipeline) {
            throw new Error('Embedder not initialized. Call load() first.')
        }

        const snippet = text.slice(0, 15)
        const logMsg = `${snippet}... (${text.length} chars)`
        console.time(logMsg)
        const output = await this.#pipeline(text, {
            pooling: 'mean',
            normalize: true,
        })
        console.timeEnd(logMsg)

        return Array.from(output.data)
    }
}
