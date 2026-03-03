import { isDef, isStr } from "jty";

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
    #messages = []

    constructor(systemPrompt) {
        if (isDef(systemPrompt)) {
            if (!isStr(systemPrompt)) {
                throw new TypeError(`Expected systemPrompt to be a string, but got ${systemPrompt} (${typeof systemPrompt})`)
            }
            this.addMessage(systemMessage(systemPrompt))
        }
    }

    addMessage(message) {
        this.#messages.push(message)
    }

    get messages() {
        return this.#messages
    }
}