import { ContentWMsg } from './ContentWMsg.js'

/**
 * Represents a generation message originating from the 'user' role.
 * Contains textual prompts or questions provided by the user.
 */
export class UserWMsg extends ContentWMsg {
    /**
     * Checks if a given object represents a valid user message JSON structure.
     *
     * @param {any} x The object to validate.
     * @returns {boolean} True if it is a valid user message representation, false otherwise.
     */
    static isUserMsgObj(x) {
        return super.isBaseMsgObj(x, 'user')
    }

    /**
     * Initializes a new UserWMsg.
     *
     * @param {...string} contents String parts that formulate the user's prompt or question.
     */
    constructor(...contents) {
        super('user', ...contents)
    }
}
