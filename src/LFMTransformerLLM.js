import { isStr } from 'jty'
import { TransformerLLM } from './TransformersLLM.js'

/**
 * Removes tool call start and end tokens from a text string.
 * This handles cases where models leak these special tokens into the final generated text.
 *
 * @param {string} text The generated text from the LLM.
 * @returns {string} The text with tool call tokens removed, or the original input if not a string.
 */
export function stripToolCallTokens(text) {
    if (!isStr(text)) return text
    return text.replaceAll('<|tool_call_start|>', '').replaceAll('<|tool_call_end|>', '')
}

/**
 * Parses Python-style tool call strings (e.g., `[function_name(arg1="value1")]`) into OpenAI-compatible tool call objects.
 *
 * @param {string} text The raw generated text that might contain a tool call.
 * @returns {object[]|null} An array containing a single tool call object if parsing succeeds, or null if it's not a valid tool call.
 */
export function parsePythonToolCall(text) {
    if (!text) return null
    text = text.trim()

    // Fallback: If it has special tokens, strip them
    text = stripToolCallTokens(text).trim()

    if (!text.startsWith('[') || !text.endsWith(']')) {
        return null // Not a tool call block
    }

    const body = text.slice(1, -1).trim()
    const match = body.match(/^([a-zA-Z0-9_]+)\((.*)\)$/)
    if (!match) return null

    const functionName = match[1]
    const argsStr = match[2]

    const args = {}
    if (argsStr.trim().length > 0) {
        // Parse key="value" or key='value' pairs
        const regex = /([a-zA-Z0-9_]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
        let m
        while ((m = regex.exec(argsStr)) !== null) {
            args[m[1]] = m[2] !== undefined ? m[2] : m[3]
        }
    }

    return [
        {
            id: 'call_' + Math.random().toString(36).substring(2, 9),
            type: 'function',
            function: {
                name: functionName,
                arguments: JSON.stringify(args),
            },
        },
    ]
}

/**
 * Formats OpenAI-style tool definitions for compatibility with LFM2 models.
 * Extracts the inner `function` object from the tool wrapper.
 *
 * @param {object[]} tools An array of OpenAI-compatible tool objects.
 * @returns {object[]|undefined} An array of unwrapped function objects, or undefined if the input is empty or invalid.
 */
export function formatToolsForLFM2(tools) {
    if (!tools || !Array.isArray(tools)) return
    return tools.map((t) => {
        if (t.type === 'function' && t.function) {
            return t.function
        }
        return t
    })
}

/**
 * Formats OpenAI messages for compatibility with LFM2 models.
 * Specifically converts assistant tool_calls into Python-style function call strings.
 *
 * @param {object[]} messages An array of OpenAI message objects.
 * @returns {object[]} The formatted messages suitable for the LFM2 chat template.
 */
export function formatMessagesForLFM2(messages) {
    if (!messages || !Array.isArray(messages)) return messages
    return messages.map((msg) => {
        if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
            const calls = msg.tool_calls
                .filter((t) => t.type === 'function')
                .map((t) => {
                    let args = ''
                    try {
                        const parsedArgs = JSON.parse(t.function.arguments)
                        args = Object.entries(parsedArgs)
                            .map(([k, v]) => `${k}="${v}"`)
                            .join(', ')
                    } catch {
                        /* ignore parsing errors */
                    }
                    return `[${t.function.name}(${args})]`
                })
                .join('')

            return {
                role: 'assistant',
                content: calls,
            }
        }
        return msg
    })
}

/**
 * A specialized TransformerLLM implementation tailored for LFM2 models.
 * Handles LFM2's specific tool calling format (Python-style nested in brackets).
 */
export class LFMTransformerLLM extends TransformerLLM {
    /**
     * Completes a chat sequence using the LFM2 model.
     * Overrides the base complete method to handle LFM2-specific chat templates and parse tool calls from the output.
     *
     * @param {object[]} messages An array of OpenAI message objects.
     * @param {{ tools?: object[]; [key: string]: any }} options Generation options, optionally including tools.
     * @param {(token: string) => void} [onToken] Optional callback fired when a new token is generated.
     * @param {AbortSignal} [signal] An optional AbortSignal to cancel the generation request.
     * @returns {Promise<any>} The generation result, including parsed tool calls if applicable.
     */
    async complete(messages, options, onToken, signal) {
        let inputStrOrMessages = formatMessagesForLFM2(messages)
        const pipelineOptions = { ...options }

        if (options.tools && this.pipeline) {
            pipelineOptions.tools = formatToolsForLFM2(options.tools)
            inputStrOrMessages = this.pipeline.tokenizer.apply_chat_template(inputStrOrMessages, {
                tools: pipelineOptions.tools,
                add_generation_prompt: true,
                tokenize: false,
            })
            delete pipelineOptions.tools
        }

        const result = await super.complete(inputStrOrMessages, pipelineOptions, onToken, signal)

        if (Array.isArray(result) && isStr(result[0]?.generated_text)) {
            /** @type {string} rawText */
            const rawText = result[0].generated_text
            const parsedCall = parsePythonToolCall(rawText)

            if (parsedCall) {
                result[0].message = {
                    role: 'assistant',
                    content: rawText,
                    tool_calls: parsedCall,
                }
            } else {
                result[0].message = {
                    role: 'assistant',
                    content: stripToolCallTokens(rawText),
                }
            }
        }

        return result
    }
}
