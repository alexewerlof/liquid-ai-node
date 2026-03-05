import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { RAG, chunkText } from './RAG.js'
import { VectorStore } from './VectorStore.js'
import { Embedder } from './Embedder.js'

class MockEmbedder extends Embedder {
    async load() {
        return this
    }

    async embed(text) {
        if (text.includes('apple')) return [1, 0, 0]
        if (text.includes('banana')) return [0, 1, 0]
        return [0, 0, 1]
    }
}

describe('RAG', () => {
    test('chunkText splits by double newline', () => {
        const text = 'First chunk.\n\nSecond chunk.\n\n\nThird chunk.'
        const chunks = chunkText(text)
        assert.deepEqual(chunks, ['First chunk.', 'Second chunk.', 'Third chunk.'])
    })

    test('addDocument adds chunks to VectorStore', async () => {
        const store = new VectorStore()
        const embedder = new MockEmbedder('mock-model')
        await embedder.load()
        const rag = new RAG(embedder, store)

        const chunkCount = await rag.addDocument('I love eating an apple piecewise.\n\nSome banana text.', {
            src: 'fruit.txt',
        })
        assert.equal(chunkCount, 2)
    })

    test('getRelevantContext retrieves highly scored context', async () => {
        const store = new VectorStore()
        const embedder = new MockEmbedder('mock-model')
        const rag = new RAG(embedder, store)

        await rag.addDocument('I love eating an apple piecewise.\n\nSome banana text.')

        const context = await rag.getRelevantContext('give me apple', 0.5)
        assert.equal(context.length, 1)
        assert.ok(context[0].text.includes('apple'))
    })

    test('augmentQuery returns prompt with embedded context', async () => {
        const store = new VectorStore()
        const embedder = new MockEmbedder('mock-model')
        const rag = new RAG(embedder, store)
        await rag.addDocument('The secret of life is 42.')

        const augmented = await rag.augmentQuery('What is the secret of life?', 0.5)
        assert.ok(augmented.includes('The secret of life is 42.'))
    })
})
