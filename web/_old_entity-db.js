import { openDB } from '../dependencies/idb.js'
import { pipeline } from '../dependencies/@huggingface/transformers.js'
import { getDevice } from '../src/runtime.js'
import { cosineSimilarity } from '../src/VectorStore.js'
import { pipelineProgressReporter } from '../src/util.js'

// Inspired by EntityDB
// Find models that are compatible from this URL: https://huggingface.co/models?library=transformers.js&sort=trending
// You can find based on task
export class RAGEngine {
    db = null
    vectorPath = 'vector-name'
    task = 'feature-extraction'
    model = 'Xenova/all-MiniLM-L6-v2'

    constructor({ vectorPath, task, model }) {
        if (vectorPath) {
            this.vectorPath = vectorPath
        }
        if (task) {
            this.task = task
        }
        if (model) {
            this.model = model
        }
    }

    // Initialize the IndexedDB
    async init() {
        this.db = await openDB('EntityDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('vectors')) {
                    db.createObjectStore('vectors', {
                        keyPath: 'id',
                        autoIncrement: true,
                    })
                }
            },
        })
        const device = await getDevice()
        this.extractor = await pipeline(this.task, this.model, {
            device,
            progress_callback: pipelineProgressReporter,
        })
    }

    async isModelCached(modelFile = 'onnx/model.onnx', cacheName = 'transformers-cache') {
        try {
            const cache = await caches.open(cacheName)
            const cacheKey = `https://huggingface.co/${this.model}/resolve/main/${modelFile}`
            const response = await cache.match(cacheKey)
            return response !== undefined
        } catch (e) {
            console.error('Cache API check failed:', e)
            return false
        }
    }

    async removeModelFromCache(cacheName = 'transformers-cache') {
        try {
            const cache = await caches.open(cacheName)
            const requests = await cache.keys()

            let deletedCount = 0
            const modelUrlBase = `https://huggingface.co/${this.model}/`

            for (const request of requests) {
                if (request.url.startsWith(modelUrlBase)) {
                    await cache.delete(request)
                    deletedCount++
                }
            }
            console.log(`Deleted ${deletedCount} files for model ${this.model}.`)
        } catch (e) {
            console.error('Could not remove model from cache:', e)
        }
    }

    async deleteCache(cacheName = 'transformers-cache') {
        await caches.delete(cacheName)
        console.log(`All cached models have been removed from ${cacheName}`)
    }

    countTokens(text) {
        const tokens = this.extractor.tokenizer(text)
        console.log('tokens', tokens)
        console.log('tokens.input_ids.data.length', tokens.input_ids.data.length)
        // 2. Get the TypedArray of token IDs
        const tokenIdsTypedArray = tokens.input_ids.data

        // 3. Convert the TypedArray to a standard JS array of numbers
        const tokenIds = Array.from(tokenIdsTypedArray, Number)

        // 4. Access the .model property to convert IDs to token strings
        const tokenStrings = this.extractor.tokenizer.model.convert_ids_to_tokens(tokenIds)

        console.log(tokenStrings)
        // Example output: ['[CLS]', 'how', 'do', 'i', 'get', 'the', '...', '[SEP]']
        return tokens.input_ids.data.length
    }

    // Default pipeline (Xenova/all-MiniLM-L6-v2)
    // Function to get embeddings from text using HuggingFace pipeline
    async getEmbeddingFromText(text) {
        const output = await this.extractor(text, {
            pooling: 'mean',
            normalize: true,
        })
        console.debug('Extractor output:', output)
        return Array.from(output.data)
    }

    // Insert data by generating embeddings from text
    async insert(data) {
        try {
            // Generate embedding if text is provided
            let embedding = data[this.vectorPath]
            if (data.text) {
                embedding = await this.getEmbeddingFromText(data.text)
            }

            const transaction = this.db.transaction('vectors', 'readwrite')
            const store = transaction.objectStore('vectors')
            const record = { vector: embedding, ...data }
            const key = await store.add(record)
            return key
        } catch (error) {
            throw new Error(`Error inserting data: ${error}`, { cause: error })
        }
    }

    // Update an existing vector in the database
    async update(key, data) {
        const transaction = this.db.transaction('vectors', 'readwrite')
        const store = transaction.objectStore('vectors')
        const vector = data[this.vectorPath]
        const updatedData = { ...data, [store.keyPath]: key, vector }
        await store.put(updatedData)
    }

    // Delete a vector by key
    async delete(key) {
        const transaction = this.db.transaction('vectors', 'readwrite')
        const store = transaction.objectStore('vectors')
        await store.delete(key)
    }

    // Query vectors by cosine similarity (using a text input that will be converted into embeddings)
    async query(queryText, { limit = 10 } = {}) {
        try {
            // Get embeddings for the query text
            const queryVector = await this.getEmbeddingFromText(queryText)

            const transaction = this.db.transaction('vectors', 'readonly')
            const store = transaction.objectStore('vectors')
            const vectors = await store.getAll() // Retrieve all vectors

            // Calculate cosine similarity for each vector and sort by similarity
            const similarities = vectors.map((entry) => {
                const similarity = cosineSimilarity(queryVector, entry.vector)
                return { ...entry, similarity }
            })

            similarities.sort((a, b) => b.similarity - a.similarity) // Sort by similarity (descending)
            return similarities.slice(0, limit) // Return the top N results based on limit
        } catch (error) {
            throw new Error(`Error querying vectors: ${error}`, { cause: error })
        }
    }
}

// ------------------ CHAT ------------------------

// Code from: https://huggingface.co/onnx-community/Phi-3.5-mini-instruct-onnx-web

// Create a text generation pipeline
const device = await getDevice()
const generator = await pipeline('text-generation', 'onnx-community/Phi-3.5-mini-instruct-onnx-web', {
    device,
    progress_callback: pipelineProgressReporter,
})

// Define the list of messages
const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Solve the equation: x^2 + 2x - 3 = 0' },
]

// Generate a response
const output = await generator(messages, { max_new_tokens: 256, do_sample: false })
console.log(output[0].generated_text.at(-1).content)
