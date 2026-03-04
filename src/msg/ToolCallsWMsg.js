import { isArr, isObj, isStr } from "jty";
import { BaseWMsg } from "./BaseWMsg.js";

/**
 * Describes a message from an assistant that includes tool call requests.
 * @typedef {object} ToolsCallMsgObj
 * @property {string} [content] - Optional textual content part of the message.
 * @property {'assistant'} role - The role of the message sender.
 * @property {ToolCallMsgObj[]} tool_calls - An array of tool calls requested by the assistant.
 */

    /**
 * Describes a request from an LLM to call a specific tool function.
 * @typedef {object} ToolCallMsgObj
 * @property {string} id - A unique identifier for this tool call.
 * @property {'function'} type - The type of the call, always 'function'.
 * @property {object} function - The function to be called.
 * @property {string} function.name - The name of the function.
 * @property {string} function.arguments - A JSON string representing the arguments for the function.
 */

export class ToolCallsWMsg extends BaseWMsg {
    #toolCalls

    static isToolCallsMsgObj(x) {
        if (!super.isBaseMsgObj(x, 'assistant')) {
            return false
        }
        return isArr(x.toolCalls) && x.toolCalls.length > 0 && x.toolCalls.every(this.isToolCallObj)
    }

    static isToolCallObj(x) {
        if (!isObj(x)) {
            return false
        }
        return isStr(x.id) && x.type === 'function' && isObj(x.function) && isStr(x.function.name) && isStr(x.function.arguments)
    }

    constructor(toolCalls) {
        super('assistant')
        this.toolCalls = toolCalls
    }

    get toolCalls() {
        return this.#toolCalls
    }

    set toolCalls(toolCalls) {
        if (!isArr(toolCalls)) {
            throw new TypeError('toolCalls must be an array')
        }
        if (toolCalls.length === 0) {
            throw new RangeError('toolCalls must be a non-empty array')
        }
        for (const toolCall of toolCalls) {
            if (!ToolCallsWMsg.isToolCallObj(toolCall)) {
                throw new TypeError(`toolCalls must be an array of tool calls. Got ${toolCall} (${typeof toolCall})`)
            }
        }
        this.#toolCalls = toolCalls
    }

    toJSON() {
        const { role, toolCalls } = this
        return { role, tool_calls: toolCalls }
    }
}