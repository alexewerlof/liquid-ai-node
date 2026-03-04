import { isDef, isStr } from "jty";
import { SystemMessage } from "./msg/SystemMessage.js";
import { BaseWMsg } from "./msg/BaseWMsg.js";

export class Session {
    #messages = []

    constructor(systemPrompt) {
        if (isDef(systemPrompt)) {
            if (!isStr(systemPrompt)) {
                throw new TypeError(`Expected systemPrompt to be a string, but got ${systemPrompt} (${typeof systemPrompt})`)
            }
            this.addWMsg(new SystemMessage(systemPrompt))
        }
    }

    addWMsg(message) {
        if (!BaseWMsg.isBaseMsgObj(message)) {
            throw new TypeError(`Expected a message, but got ${message} (${typeof message})`)
        }
        this.#messages.push(message)
    }

    get messages() {
        return this.#messages
    }

    toMessages() {
        return this.#messages.map(m => {
            if (typeof m.toJSON === 'function') {
                return m.toJSON()
            }
            return m
        })
    }
}