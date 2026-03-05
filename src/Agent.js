import { getFirstMessage, isToolsCallMessage } from './util.js'
import { isDef, isA } from 'jty'
import { TransformerLLM } from './TransformersLLM.js'
import { Toolbox } from './Toolbox.js'
import { Session } from './Session.js'
import { AssistantWMsg } from './msg/AssistantWMsg.js'
import { ToolCallsWMsg } from './msg/ToolCallsWMsg.js'
import { ToolResultWMsg } from './msg/ToolResultWMsg.js'
import { SystemMessage } from './msg/SystemMessage.js'

/**
 * The core Agent class orchestrates the execution flow between a Large Language Model (LLM),
 * a conversation session, and an optional toolbox.
 * It handles the loop of sending messages to the LLM and processing any resulting tool calls
 * until a final response is generated.
 */
export class Agent {
    /** Max consecutive tools calls */
    static MAX_CALLS = 5

    #llm
    #abortController
    #session
    #toolbox = undefined

    /**
     * Initializes a new Agent instance.
     *
     * @param {TransformerLLM} llm The LLM instance used for generating responses.
     * @param {Session} session The chat session responsible for storing message history.
     * @param {Toolbox} [toolbox] An optional toolbox containing tools the agent can use.
     */
    constructor(llm, session, toolbox) {
        this.llm = llm
        this.session = session
        if (isDef(toolbox)) {
            this.toolbox = toolbox
        }
    }

    /**
     * Gets the LLM instance.
     * @returns {TransformerLLM}
     */
    get llm() {
        return this.#llm
    }

    /**
     * Sets the LLM instance.
     * @param {TransformerLLM} llm
     * @throws {TypeError} If the provided LLM is not an instance of TransformerLLM.
     */
    set llm(llm) {
        if (!isA(llm, TransformerLLM)) {
            throw new TypeError(`Expected llm to be an instance of TransformerLLM. Got ${llm} (${typeof llm})`)
        }
        this.#llm = llm
    }

    /**
     * Gets the Session instance.
     * @returns {Session}
     */
    get session() {
        return this.#session
    }

    /**
     * Sets the Session instance.
     * @param {Session} session
     * @throws {TypeError} If the provided session is not an instance of Session.
     */
    set session(session) {
        if (!isA(session, Session)) {
            throw new TypeError(`Expected session to be an instance of Session. Got ${session} (${typeof session})`)
        }
        this.#session = session
    }

    /**
     * Gets the Toolbox instance.
     * @returns {Toolbox|undefined}
     */
    get toolbox() {
        return this.#toolbox
    }

    /**
     * Sets the Toolbox instance.
     * @param {Toolbox} toolbox
     * @throws {TypeError} If the provided toolbox is not an instance of Toolbox.
     */
    set toolbox(toolbox) {
        if (!isA(toolbox, Toolbox)) {
            throw new TypeError(`Expected tools to be an instance of Toolbox. Got ${toolbox} (${typeof toolbox})`)
        }
        this.#toolbox = toolbox
    }

    /**
     * Checks if the agent is currently generating a response or executing tools.
     * @returns {boolean} True if the agent is busy, false otherwise.
     */
    get isBusy() {
        return this.#abortController !== undefined
    }

    /**
     * Completes a conversation sequence, handling automatic tool calls if a Toolbox is attached.
     * This will enter a loop where it queries the LLM and executes requested tools until the LLM yields a final text answer.
     *
     * @param {object[]} [messages] Optional explicit array of messages to send. If omitted, uses the session's history.
     * @param {object} [options={}] Additional generation options for the LLM.
     * @param {(token: string) => void} [onToken] Optional callback invoked when a new generation token is yielded.
     * @param {AbortSignal} [signal] Optional abort signal to cancel the generation loop.
     * @returns {Promise<AssistantWMsg|void>} Returns the final Assistant message if successful, otherwise yields void and logs the error.
     */
    async complete(messages, options = {}, onToken, signal) {
        try {
            let consecutiveToolsCalls = 0
            let lastMessageWasToolsCall = true
            do {
                const currentMessages = messages || (await this.session.toMessages())

                const start = Date.now()

                this.#abortController = new AbortController()
                const currentSignal = signal || this.#abortController.signal

                const generationOptions = {
                    tools: this.toolbox ? this.toolbox.descriptor : undefined,
                }
                Object.assign(generationOptions, options)

                const completion = await this.llm.complete(currentMessages, generationOptions, onToken, currentSignal)
                if (!signal) this.#abortController = undefined

                const message = getFirstMessage(completion)
                const duration = Date.now() - start

                console.debug('\n[DEBUG] LLM raw message output:', JSON.stringify(message, null, 2))
                console.debug('[DEBUG] Completion duration (ms):', duration)

                lastMessageWasToolsCall = this.toolbox && isToolsCallMessage(message)
                console.debug('[DEBUG] isToolsCallMessage:', !!lastMessageWasToolsCall)

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
                    throw new Error(`Stopping due to too many tool calls (max=${Agent.MAX_CALLS})`)
                }

                const toolResultMessages = await this.toolbox.exeToolCalls(message)
                for (const toolResultMessage of toolResultMessages) {
                    this.session.addWMsg(new ToolResultWMsg(toolResultMessage.tool_call_id, toolResultMessage.content))
                }
                messages = undefined // Use session history for subsequent calls
            } while (lastMessageWasToolsCall)
        } catch (error) {
            this.#abortController = undefined
            this.session.addWMsg(new SystemMessage(`Error: ${error.message}`))
            console.error(error)
        }
    }

    /**
     * Aborts an ongoing completion request if the agent is currently busy.
     *
     * @param {*} [reason] An optional reason for aborting the operation.
     */
    abortCompletion(reason) {
        if (this.#abortController) {
            this.#abortController.abort(reason)
            this.#abortController = undefined
        }
    }
}
