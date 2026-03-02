import { isFn, isStr } from "jty";
import { createPipeline } from "./runtime.js";
import { TextStreamer } from "@huggingface/transformers";
import { systemPrompt } from "./config.js";

const SUPPORTED_ROLES = ['system', 'user', 'assistant']

function message(role, content) {
    if (!SUPPORTED_ROLES.includes(role)) {
        throw new Error(`Unsupported role: ${role}`)
    }
    if (!isStr(content)) {
        throw new Error(`Expected content to be a string, but got ${content} (${typeof content})`)
    }
    return { role, content }
}

export function systemMessage(content) {
    return message('system', content)
}

export function userMessage(content) {
    return message('user', content)
}

export function assistantMessage(content) {
    return message('assistant', content)
}

export class Session {
    #pipeline = null
    #messages = []

    constructor() {
        this.addMessage(systemMessage(systemPrompt))
    }

    async init(model_name, options) {
        this.#pipeline = await createPipeline('text-generation', model_name, options)
    }

    addMessage(message) {
        this.#messages.push(message)
    }

    async complete(options, onToken) {
        if (!isFn(onToken)) {
            throw new TypeError(`Expected a function for onToken. Got ${onToken} (${typeof onToken})`);
        }

        const streamer = new TextStreamer(this.#pipeline.tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function: isFn(onToken) ? onToken : undefined,
        });
    
        await this.#pipeline(this.#messages, { ...options, streamer });
    }
}