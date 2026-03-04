import { getFirstMessage, isToolsCallMessage } from './util.js'
import { isDef, isA } from 'jty'
import { TransformerLLM } from './TransformersLLM.js'
import { Toolbox } from './Toolbox.js'
import { Session } from './Session.js'
import { AssistantWMsg } from './msg/AssistantWMsg.js'
import { ToolCallsWMsg } from './msg/ToolCallsWMsg.js'
import { ToolResultWMsg } from './msg/ToolResultWMsg.js'
import { SystemMessage } from './msg/SystemMessage.js'

export class Agent {
    /** Max consecutive tools calls */
    static MAX_CALLS = 5

    #llm
    #abortController
    #session
    #toolbox = undefined

    constructor(llm, session, toolbox) {
        this.llm = llm
        this.session = session
        if (isDef(toolbox)) {
            this.toolbox = toolbox
        }
    }

    get llm() {
        return this.#llm
    }

    set llm(llm) {
        if (!isA(llm, TransformerLLM)) {
            throw new TypeError(
                `Expected llm to be an instance of TransformerLLM. Got ${llm} (${typeof llm})`,
            )
        }
        this.#llm = llm
    }

    get session() {
        return this.#session
    }

    set session(session) {
        if (!isA(session, Session)) {
            throw new TypeError(
                `Expected session to be an instance of Session. Got ${session} (${typeof session})`,
            )
        }
        this.#session = session
    }

    get toolbox() {
        return this.#toolbox
    }

    set toolbox(toolbox) {
        if (!isA(toolbox, Toolbox)) {
            throw new TypeError(
                `Expected tools to be an instance of Toolbox. Got ${toolbox} (${typeof toolbox})`,
            )
        }
        this.#toolbox = toolbox
    }

    get isBusy() {
        return this.#abortController !== undefined
    }

    async complete(messages, options = {}, onToken, signal) {
        try {
            let consecutiveToolsCalls = 0
            let lastMessageWasToolsCall = true
            do {
                const currentMessages =
                    messages || (await this.session.toMessages())

                const start = Date.now()

                this.#abortController = new AbortController()
                const currentSignal = signal || this.#abortController.signal

                const generationOptions = {
                    tools: this.toolbox ? this.toolbox.descriptor : undefined,
                }
                Object.assign(generationOptions, options)

                const completion = await this.llm.complete(
                    currentMessages,
                    generationOptions,
                    onToken,
                    currentSignal,
                )
                if (!signal) this.#abortController = undefined

                const message = getFirstMessage(completion)
                const tokenStats = { duration: Date.now() - start } // simplified

                console.debug(
                    '\n[DEBUG] LLM raw message output:',
                    JSON.stringify(message, null, 2),
                )

                lastMessageWasToolsCall =
                    this.toolbox && isToolsCallMessage(message)
                console.debug(
                    '[DEBUG] isToolsCallMessage:',
                    !!lastMessageWasToolsCall,
                )

                if (!lastMessageWasToolsCall) {
                    const msg = new AssistantWMsg(message.content || '')
                    // msg.tokenStats = tokenStats; // omitted
                    this.session.addWMsg(msg)
                    return msg
                }

                const msg = new ToolCallsWMsg(message.tool_calls)
                this.session.addWMsg(msg)
                consecutiveToolsCalls++

                if (consecutiveToolsCalls > Agent.MAX_CALLS) {
                    throw new Error(
                        `Stopping due to too many tool calls (max=${Agent.MAX_CALLS})`,
                    )
                }

                const toolResultMessages =
                    await this.toolbox.exeToolCalls(message)
                for (const toolResultMessage of toolResultMessages) {
                    this.session.addWMsg(
                        new ToolResultWMsg(
                            toolResultMessage.tool_call_id,
                            toolResultMessage.content,
                        ),
                    )
                }
                messages = undefined // Use session history for subsequent calls
            } while (lastMessageWasToolsCall)
        } catch (error) {
            this.#abortController = undefined
            this.session.addWMsg(new SystemMessage(`Error: ${error.message}`))
            console.error(error)
        }
    }

    abortCompletion(reason) {
        if (this.#abortController) {
            this.#abortController.abort(reason)
            this.#abortController = undefined
        }
    }
}
