import { isStr } from 'jty'
import { TransformerLLM } from './TransformersLLM.js'

export function stripToolCallTokens(text) {
    if (!isStr(text)) return text
    return text
        .replaceAll('<|tool_call_start|>', '')
        .replaceAll('<|tool_call_end|>', '')
}

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

export function formatToolsForLFM2(tools) {
    if (!tools || !Array.isArray(tools)) return
    return tools.map((t) => {
        if (t.type === 'function' && t.function) {
            return t.function
        }
        return t
    })
}

export function formatMessagesForLFM2(messages) {
    if (!messages || !Array.isArray(messages)) return messages
    return messages.map((msg) => {
        if (
            msg.role === 'assistant' &&
            msg.tool_calls &&
            msg.tool_calls.length > 0
        ) {
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

export class LFMTransformerLLM extends TransformerLLM {
    /**
     * @param {object[]} messages An array of OpenAI message objects
     * @param {{ tools?: object[]; }} options
     * @param {(token: string) => void} [onToken] Optional function that takes the token string when it's generated
     * @param {AbortSignal} [signal] An AbortSignal instance to cancel the request
     */
    async complete(messages, options, onToken, signal) {
        let inputStrOrMessages = formatMessagesForLFM2(messages)
        const pipelineOptions = { ...options }

        if (options.tools && this.pipeline) {
            pipelineOptions.tools = formatToolsForLFM2(options.tools)
            inputStrOrMessages = this.pipeline.tokenizer.apply_chat_template(
                inputStrOrMessages,
                {
                    tools: pipelineOptions.tools,
                    add_generation_prompt: true,
                    tokenize: false,
                },
            )
            delete pipelineOptions.tools
        }

        const result = await super.complete(
            inputStrOrMessages,
            pipelineOptions,
            onToken,
            signal,
        )

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
