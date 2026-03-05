import { isA, isArr, isDef, isFn, isStr } from 'jty'
import { createPipeline } from './runtime.js'
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

    /**
     * Gets the current, initialized text-generation pipeline.
     * @returns {object|null} The pipeline instance, or null if uninitialized.
     */
    get pipeline() {
        return this.#pipeline
    }

    /**
     * Initializes the text-generation pipeline. Must be called before `complete()`.
     *
     * @param {string} model_name The Hugging Face model ID to load.
     * @param {object} [options] Optional pipeline configuration (e.g. `dtype`).
     * @returns {Promise<TransformerLLM>} Returns `this` instance for chaining.
     */
    async init(model_name, options) {
        this.#pipeline = await createPipeline('text-generation', model_name, options)
        return this
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
     * @throws {Error} If `init()` has not been called prior.
     */
    async complete(messages, options, onToken, signal) {
        if (!isArr(messages) && !isStr(messages)) {
            throw new TypeError(`Expected messages to be an array or string, but got ${messages} (${typeof messages})`)
        }
        if (!this.#pipeline) {
            throw new Error('Pipeline not initialized. Call init() first.')
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
        return result
    }
}
