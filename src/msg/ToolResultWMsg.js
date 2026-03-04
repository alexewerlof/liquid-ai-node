import { isStr } from "jty";
import { ContentWMsg } from "./ContentWMsg.js";

/**
 * Creates a ToolResultMessage object.
 * @param {string} id - The ID of the tool call.
 * @param {string} content - The result content from the tool execution.
 * @returns {ToolResultMessage} The constructed tool result message.
 */
export function toolResultMessage(id, content) {
    return {
        role: 'tool',
        tool_call_id: id,
        content,
    }
}

export class ToolResultWMsg extends ContentWMsg {
    #toolCallId

    static isToolResultMsgObj(x) {
        if (!super.isBaseMsgObj(x, 'tool')) {
            return false
        }
        return isStr(x.tool_call_id) && isStr(x.content)
    }

    constructor(toolCallId, result) {
        super('tool')
        this.toolCallId = toolCallId
        this.content = isStr(result) ? result : JSON.stringify(result)
    }

    get toolCallId() {
        return this.#toolCallId
    }

    set toolCallId(toolCallId) {
        if (!isStr(toolCallId)) {
            throw new TypeError('toolCallId must be a string')
        }
        this.#toolCallId = toolCallId
    }

    toJSON() {
        return {
            role: this.role,
            tool_call_id: this.#toolCallId,
            content: this.content,
        }
    }
}