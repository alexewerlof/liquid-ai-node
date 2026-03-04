import { isA, isArr, isDef, isFn, isStr } from 'jty'
import { createPipeline } from './runtime.js'
import {
    TextStreamer,
    StoppingCriteria,
    StoppingCriteriaList,
} from '@huggingface/transformers'

class SignalStoppingCriteria extends StoppingCriteria {
    constructor(signal) {
        super()
        if (!isA(signal, AbortSignal)) {
            throw new TypeError(
                `Expected signal to be an AbortSignal, but got ${signal} (${typeof signal})`,
            )
        }
        this.signal = signal
    }
    _call(input_ids, scores) {
        if (this.signal?.aborted) {
            return new Array(input_ids.length).fill(true)
        }
        return new Array(input_ids.length).fill(false)
    }
}

export class TransformerLLM {
    #pipeline = null

    get pipeline() {
        return this.#pipeline
    }

    async init(model_name, options) {
        this.#pipeline = await createPipeline(
            'text-generation',
            model_name,
            options,
        )
        return this
    }

    async complete(messages, options, onToken, signal) {
        if (!isArr(messages) && !isStr(messages)) {
            throw new TypeError(
                `Expected messages to be an array or string, but got ${messages} (${typeof messages})`,
            )
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
                throw new TypeError(
                    `Expected signal to be an AbortSignal, but got ${signal} (${typeof signal})`,
                )
            }
            const stoppingCriteriaList = new StoppingCriteriaList()
            stoppingCriteriaList.push(new SignalStoppingCriteria(signal))
            pipelineOptions.stopping_criteria = stoppingCriteriaList
        }

        const result = await this.#pipeline(messages, pipelineOptions)
        return result
    }
}
