import { RAG } from "../src/RAG.js";
import { doc, JJHE } from '../dependencies/jj.js'
import { VectorStore } from "../src/VectorStore.js";
import { Embedder } from "../src/Embedder.js";
import { h } from "jj";

const textInput = doc.find('#text-to-insert', true)
const insertButton = doc.find('#insert-text', true)
const records = doc.find('#records', true)

const queryInput = doc.find('#query-text', true)
const queryButton = doc.find('#query-button', true)
const queryResults = doc.find('#query-results', true)
const countTokensButton = doc.find('#count-tokens', true)
const tokenCount = doc.find('#token-count', true)

console.time('RAG initialization')
const vectorStore = new VectorStore()
const embedder = new Embedder()
await embedder.init("Xenova/all-MiniLM-L6-v2")
const rag = new RAG(embedder, vectorStore);
console.timeEnd('RAG initialization')

console.time('Adding documents')
await rag.addDocument("cat", { timestamp: Date.now() })
await rag.addDocument("dog", { timestamp: Date.now() })
await rag.addDocument("bird", { timestamp: Date.now() })
await rag.addDocument("fish", { timestamp: Date.now() })
await rag.addDocument("lizard", { timestamp: Date.now() })
await rag.addDocument("snake", { timestamp: Date.now() })
await rag.addDocument("turtle", { timestamp: Date.now() })
await rag.addDocument("hamster", { timestamp: Date.now() })
await rag.addDocument("guinea pig", { timestamp: Date.now() })
await rag.addDocument("rabbit", { timestamp: Date.now() })
console.timeEnd('Adding documents')

textInput.on('keyup', (evt) => {
    if (evt.key === 'Enter') {
        insertButton.ref.click()
    }
})

insertButton.on('click', async () => {
    try {
        const text = textInput.getValue()
        console.time(`Inserting ${text}`)
        const id = await rag.addDocument(text, { timestamp: Date.now() })
        console.timeEnd(`Inserting ${text}`)
        textInput.setValue('')
        records.addChild(
            JJHE.create('li').setText(`${id}: ${text}`)
        )
        console.debug(`${id}: ${text}`)
    } catch (e) {
        console.error(e)
    }
});

queryInput.on('keyup', (evt) => {
    if (evt.key === 'Enter') {
        queryButton.ref.click()
    }
})

queryButton.on('click', async () => {
    try {
        const query = queryInput.getValue()
        console.time(`Querying ${query}`)
        const results = await rag.getRelevantContext(query)
        console.timeEnd(`Querying ${query}`)
        console.debug(results)
        queryResults.empty().addChildMap(results, r => h('li', null, `${r.score.toFixed(3)} --> ${r.text}`))
        queryInput.setValue('')
    } catch (e) {
        console.error(e)
    }
});

countTokensButton.on('click', () => {
    tokenCount.setText(rag.countTokens(queryInput.getValue()))
})