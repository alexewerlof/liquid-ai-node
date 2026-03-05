import { isDef, isStr } from 'jty'
import { SystemMessage } from './msg/SystemMessage.js'
import { BaseWMsg } from './msg/BaseWMsg.js'

/**
 * Represents a conversation history containing messages between the user and the assistant.
 */
export class Session {
    /** @type {BaseWMsg[]} */
    #messages = []

    /**
     * Initializes a new Session instance.
     *
     * @param {string} [systemPrompt] Optional initial system prompt to start the conversation context.
     * @throws {TypeError} If the provided system prompt is not a string.
     */
    constructor(systemPrompt) {
        if (isDef(systemPrompt)) {
            if (!isStr(systemPrompt)) {
                throw new TypeError(
                    `Expected systemPrompt to be a string, but got ${systemPrompt} (${typeof systemPrompt})`,
                )
            }
            this.addWMsg(new SystemMessage(systemPrompt))
        }
    }

    /**
     * Adds a new message wrapper object to the session history.
     *
     * @param {BaseWMsg} message The message wrapper object to add.
     * @throws {TypeError} If the input is not a recognized BaseWMsg object structure.
     */
    addWMsg(message) {
        if (!BaseWMsg.isBaseMsgObj(message)) {
            throw new TypeError(`Expected a message, but got ${message} (${typeof message})`)
        }
        this.#messages.push(message)
    }

    /**
     * Retrieves the array of message wrapper objects currently in the session.
     * @returns {BaseWMsg[]} The array of messages.
     */
    get messages() {
        return this.#messages
    }

    /**
     * Converts the internal session message wrappers into a plain array of OpenAI-compatible objects.
     *
     * @returns {object[]} Array of plain JSON-compatible message objects.
     */
    toMessages() {
        return this.#messages.map((m) => {
            if (typeof m.toJSON === 'function') {
                return m.toJSON()
            }
            return m
        })
    }
}
