import { RAGEngine } from "./entity-db.js";
import { doc, JJHE } from '../dependencies/jj.js'

const textInput = doc.find('#text-to-insert', true)
const insertButton = doc.find('#insert-text', true)
const records = doc.find('#records', true)

const queryInput = doc.find('#query-text', true)
const queryButton = doc.find('#query-button', true)
const queryResults = doc.find('#query-results', true)
const countTokensButton = doc.find('#count-tokens', true)
const tokenCount = doc.find('#token-count', true)

console.time('RAGEngine initialization')
const ragEngine = new RAGEngine({
    vectorPath: "db_name",
    model: "Xenova/all-MiniLM-L6-v2", // a HuggingFace embeddings model
});
await ragEngine.init()
console.timeEnd('RAGEngine initialization')

textInput.on('keyup', (evt) => {
    if (evt.key === 'Enter') {
        insertButton.ref.click()
    }
})

insertButton.on('click', async () => {
    try {
        const text = textInput.getValue()
        console.time(`Inserting ${text}`)
        const id = await ragEngine.insert({
            text,
        })
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
        const results = await ragEngine.query(query)
        console.timeEnd(`Querying ${query}`)
        console.debug(results)
        queryResults.empty()
        for (const result of results) {
            queryResults.addChild(
                JJHE.create('li').setText(`${result.similarity} --> ${result.id}: ${result.text}`)
            )
        }
        queryInput.setValue('')
    } catch (e) {
        console.error(e)
    }
});

countTokensButton.on('click', () => {
    tokenCount.setText(ragEngine.countTokens(queryInput.getValue()))
})