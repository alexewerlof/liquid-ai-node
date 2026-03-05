import { isA, isArr, isDef, isFn, isStr, isNum } from 'jty'
import { createPipeline } from './runtime.js'
import { clamp, sec2ms } from './util.js'
import { TextStreamer, StoppingCriteria, StoppingCriteriaList } from '@huggingface/transformers'

/**
 * Custom stopping criteria that halts LLM text generation when an AbortSignal is specifically triggered.
 * Extends Hugging Face's `StoppingCriteria`.
 */
class SignalStoppingCriteria extends StoppingCriteria {
    /**
     * Initializes the stopping criteria with a specific abort signal.
     *
     * @param {AbortSignal} signal The signal to listen to for cancellations.
     * @throws {TypeError} If the provided signal is not an instance of AbortSignal.
     */
    constructor(signal) {
        super()
        if (!isA(signal, AbortSignal)) {
            throw new TypeError(`Expected signal to be an AbortSignal, but got ${signal} (${typeof signal})`)
        }
        this.signal = signal
    }
    /**
     * Called by the generation pipeline to determine if generation should be stopped.
     *
     * @param {number[][]} input_ids The current token sequence IDs generated so far.
     * @param {number[][]} scores The predicted scores for the next token.
     * @returns {boolean[]} An array of booleans indicating whether generation should stop for each sequence.
     */
    // eslint-disable-next-line no-unused-vars
    _call(input_ids, scores) {
        if (this.signal?.aborted) {
            return new Array(input_ids.length).fill(true)
        }
        return new Array(input_ids.length).fill(false)
    }
}

/**
 * Base wrapper around Hugging Face's Transformers.js library.
 * Provides a simplified, asynchronous interface for text-generation pipelines, stream tracking, and stopping logic.
 */
export class TransformerLLM {
    #pipeline = null
    #ttlTimer = null
    #ttl = 0
    #modelName = null
    #pipelineOptions = null

    /**
     * Creates a new TransformerLLM instance.
     * @param {string} modelName The Hugging Face model ID to load.
     * @param {object} [pipelineOptions={}] Optional pipeline configuration (e.g. `dtype`).
     */
    constructor(modelName, pipelineOptions = {}) {
        this.#modelName = modelName
        this.#pipelineOptions = pipelineOptions
    }

    /**
     * Gets the current, initialized text-generation pipeline.
     * @returns {object|null} The pipeline instance, or null if uninitialized.
     */
    get pipeline() {
        return this.#pipeline
    }

    /**
     * Gets the current configured TTL in milliseconds.
     * @returns {number} The active TTL in milliseconds.
     */
    get ttl() {
        return this.#ttl
    }

    /**
     * Sets the Time-To-Live (TTL) for the loaded model in memory.
     * The model will automatically be unloaded from memory after this period of inactivity.
     * 0 disables auto-unloading.
     *
     * @param {number} seconds The TTL in seconds. Will be clamped between 30 and 604800 (7 days).
     * @throws {TypeError} If seconds is not a number.
     */
    setTTL(seconds) {
        if (!isNum(seconds)) {
            throw new TypeError('seconds must be a number')
        }
        if (seconds === 0) {
            this.#ttl = 0
            this.#clearTimer()
            return
        }

        const MIN_TTL = 30
        const MAX_TTL = 7 * 24 * 60 * 60 // 7 days

        const finalSeconds = clamp(seconds, MIN_TTL, MAX_TTL)
        this.#ttl = sec2ms(finalSeconds)
    }

    /**
     * Loads the text-generation pipeline into memory.
     *
     * @returns {Promise<TransformerLLM>} Returns `this` instance for chaining.
     */
    async load() {
        if (this.#pipeline) return this
        this.#pipeline = await createPipeline('text-generation', this.#modelName, this.#pipelineOptions)
        return this
    }

    /**
     * Manually unloads the model from memory to free up resources.
     */
    async unload() {
        if (this.#pipeline) {
            await this.#pipeline.dispose()
            this.#pipeline = null
        }
        this.#clearTimer()
    }

    #clearTimer() {
        if (this.#ttlTimer) {
            clearTimeout(this.#ttlTimer)
            this.#ttlTimer = null
        }
    }

    #startTimer() {
        this.#clearTimer()
        if (this.#ttl > 0) {
            this.#ttlTimer = setTimeout(() => {
                this.unload().catch((e) => console.error('Error auto-unloading model:', e))
            }, this.#ttl)
        }
    }

    /**
     * Generates a text completion based on the given messages.
     * Also supports streaming token output and aborting generation.
     *
     * @param {string|object[]} messages The input prompt string, or an array of message objects.
     * @param {object} [options] Text generation options (e.g. `max_new_tokens`).
     * @param {(token: string) => void} [onToken] Optional callback invoked whenever a new text token is appended.
     * @param {AbortSignal} [signal] Optional signal to cancel the text generation early.
     * @returns {Promise<any>} The response block produced by the pipeline (format varies based on the underlying model and tokenizer setup).
     * @throws {TypeError} If `messages` or `signal` are of invalid types.
     * @throws {Error} If `load()` has not been called prior and a cold start fails.
     */
    async complete(messages, options, onToken, signal) {
        if (!isArr(messages) && !isStr(messages)) {
            throw new TypeError(`Expected messages to be an array or string, but got ${messages} (${typeof messages})`)
        }

        if (!this.#modelName) {
            throw new Error('Model configuration missing. Pass modelName to constructor first.')
        }

        this.#clearTimer()

        // On-demand load (Cold Start)
        if (!this.#pipeline) {
            await this.load()
        }

        const onTokenIsFn = isFn(onToken)

        const buffer = []
        const streamer = new TextStreamer(this.#pipeline.tokenizer, {
            skip_prompt: true,
            skip_special_tokens: options?.skip_special_tokens ?? true,
            callback_function(token) {
                buffer.push(token)
                if (onTokenIsFn) {
                    try {
                        onToken(token)
                    } catch (e) {
                        console.error(`Error calling onToken: ${e}`)
                    }
                }
            },
        })

        const pipelineOptions = { ...options, streamer }

        if (isDef(signal)) {
            if (!isA(signal, AbortSignal)) {
                throw new TypeError(`Expected signal to be an AbortSignal, but got ${signal} (${typeof signal})`)
            }
            const stoppingCriteriaList = new StoppingCriteriaList()
            stoppingCriteriaList.push(new SignalStoppingCriteria(signal))
            pipelineOptions.stopping_criteria = stoppingCriteriaList
        }

        const result = await this.#pipeline(messages, pipelineOptions)

        this.#startTimer()

        return result
    }
}
