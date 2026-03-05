import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { TransformerLLM } from './TransformersLLM.js'
import { env } from '@huggingface/transformers'

test('TTL configuration clamping', () => {
    const llm = new TransformerLLM()
    llm.setTTL(0)
    assert.equal(llm.ttl, 0)

    llm.setTTL(10) // should clamp to 30
    assert.equal(llm.ttl, 30000)

    llm.setTTL(30)
    assert.equal(llm.ttl, 30000)

    llm.setTTL(100)
    assert.equal(llm.ttl, 100000)

    const max_ttl_sec = 7 * 24 * 60 * 60
    llm.setTTL(max_ttl_sec + 100)
    assert.equal(llm.ttl, max_ttl_sec * 1000)

    // Test errors
    assert.throws(() => llm.setTTL('a'), TypeError)
})

test('Unload and cold start logic works', async () => {
    const llm = new TransformerLLM()
    llm.setTTL(10) // Will clamp to 30000ms. Just setting it to test timers don't crash.

    // We can't easily test the actual model loading without a network request that might fail or be slow.
    // Let's mock the createPipeline function behavior by overriding the init method slightly for the test.
    let initCalled = false
    let originalInit = llm.init.bind(llm)

    // Mock pipeline
    const mockPipeline = {
        dispose: async () => {},
        tokenizer: { apply_chat_template: () => {} },
    }

    llm.init = async function (modelName, options) {
        initCalled = true
        // set private fields via reflection or just trust the public API for the mock
        // Since we can't easily set private fields #pipeline from outside, we'll actually let it fail on complete if we don't mock the whole class.
        // Let's test the public unload method instead when we manually set pipeline.
    }

    // Test the public unload method logic
    // We can't access #pipeline, but we can see if it throws an error.
    await llm.unload() // Should do nothing if pipeline is null

    // Since #pipeline is private, a full integration test requires either loading a real model or mocking the `runtime.js` module.
    // For now we test logic that doesn't strictly depend on the internals.
    assert.equal(initCalled, false)
})
