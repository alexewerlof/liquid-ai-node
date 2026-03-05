import { ContentWMsg } from './ContentWMsg.js'

/**
 * Represents a generation message originating from the 'system' role.
 * Used for storing instructions that guide the LLM's behavior.
 */
export class SystemMessage extends ContentWMsg {
    /**
     * Checks if a given object represents a valid system message JSON structure.
     *
     * @param {any} x The object to validate.
     * @returns {boolean} True if it is a valid system message representation, false otherwise.
     */
    static isSystemMsgObj(x) {
        return super.isBaseMsgObj(x, 'system')
    }

    /**
     * Initializes a new SystemMessage.
     *
     * @param {...string} contents String parts that formulate the system message instructions.
     */
    constructor(...contents) {
        super('system', ...contents)
    }
}
