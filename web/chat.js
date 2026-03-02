import { doc } from "jj"
import { Session, userMessage } from "../src/Session.js"
import { inference } from "../src/config.js"

const initChatButton = doc.find('#init-chat', true)
const chatSection = doc.find('#chat-section', true)
const promptInput = doc.find('#prompt', true)
const submitButton = doc.find('#submit-prompt', true)

let chat = null

initChatButton.on('click', async () => {
    try {
        chat = new Session()
        await chat.init(inference.modelId, inference.options)
        chatSection.show()
        initChatButton.hide()
    } catch (e) {
        console.error(e)
    }
})

submitButton.on('click', async () => {
    try {
        const prompt = promptInput.getValue()
        chat.addMessage(userMessage(prompt))
        await chat.complete(inference.generation, (text) => {
            console.log(text)
        })
    } catch (e) {
        console.error(e)
    }
})

promptInput.on('keydown', async (e) => {
    if (e.key === 'Enter') {
        submitButton.click()
    }
})