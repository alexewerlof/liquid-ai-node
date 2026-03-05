import { isStr } from 'jty'
import { BaseWMsg } from './BaseWMsg.js'

/**
 * A message base class representing messages that contain string "content", like user and assistant messages.
 */
export class ContentWMsg extends BaseWMsg {
    /** @type {string} */
    #content = ''

    /**
     * Verifies if an object is a valid ContentWMsg object.
     * Validates both the base message structure and ensures it contains a string payload.
     *
     * @param {any} x The object to validate.
     * @returns {boolean} True if it is a structurally sound Content message, false otherwise.
     */
    static isContentMessage(x) {
        if (!super.isBaseMsgObj(x)) {
            return false
        }
        // @ts-ignore
        return isStr(x.content)
    }

    /**
     * Initializes a generic text-content message wrapper.
     *
     * @param {string} role The role ID (e.g. 'assistant', 'user').
     * @param {...string} contents String parts indicating the initial message content payload.
     */
    constructor(role, ...contents) {
        super(role)
        this.append(...contents)
    }

    /**
     * Appends additional text elements to the message. Useful for streaming contexts.
     *
     * @param {...string} contents Text payload strands to add to the existing content string.
     */
    append(...contents) {
        for (const content of contents) {
            this.#content += String(content)
        }
    }

    /**
     * Retrieves the text string payload of the message representation.
     * @returns {string} The text message payload.
     */
    get content() {
        return this.#content
    }

    /**
     * Sets the actual text payload.
     *
     * @param {string} content The new string payload to attach to the role.
     * @throws {TypeError} If the given content is not a string.
     */
    set content(content) {
        if (!isStr(content)) {
            throw new TypeError(`Expected content to be a string, but got ${content} (${typeof content})`)
        }
        this.#content = content
    }

    /**
     * Translates the instance back into an OpenAI completion-equivalent JSON message.
     *
     * @returns {{role: string, content: string}} The plain-object interpretation.
     */
    toJSON() {
        const { role, content } = this
        return { role, content }
    }
}
