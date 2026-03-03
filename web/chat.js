import { doc } from "jj"
import { Session, userMessage } from "../src/Session.js"
import { inference, systemPrompt } from "../src/config.js"
import { TransformerLLM } from "../src/TransformersLLM.js"

const initChatButton = doc.find('#init-chat', true)
const chatSection = doc.find('#chat-section', true)
const promptInput = doc.find('#prompt', true)
const submitButton = doc.find('#submit-prompt', true)
const stopButton = doc.find('#stop-prompt', true)

const session = new Session()
let controller = null
let llm = null

initChatButton.on('click', async () => {
    try {
        llm = new TransformerLLM(systemPrompt)
        await llm.init(inference.modelId, inference.options)
        chatSection.show()
        initChatButton.hide()
    } catch (e) {
        console.error(e)
    }
})

submitButton.on('click', async () => {
    try {
        const prompt = promptInput.getValue()
        session.addMessage(userMessage(prompt))
        controller = new AbortController()
        const full = await llm.complete(session.messages, inference.generation, (text) => {
            console.log(text)
        }, controller.signal)
        console.log(full)
    } catch (e) {
        console.error(e)
    }
})

stopButton.on('click', async () => {
    try {
        controller?.abort()
    } catch (e) {
        console.error(e)
    }
})

promptInput.on('keydown', async (e) => {
    if (e.key === 'Enter') {
        submitButton.click()
    }
})