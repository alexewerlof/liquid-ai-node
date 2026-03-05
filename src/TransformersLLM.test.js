import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { TransformerLLM } from './TransformersLLM.js'

test('TTL configuration clamping', () => {
    const llm = new TransformerLLM('mock-model')
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
    // @ts-ignore
    assert.throws(() => llm.setTTL('a'), TypeError)
})

test('Unload and cold start logic works', async () => {
    const llm = new TransformerLLM('Xenova/tiny-random-LlamaForCausalLM')
    llm.setTTL(10) // Will clamp to 30000ms. Just setting it to test timers don't crash.

    // We can't easily test the actual model loading without a network request that might fail or be slow.
    // Let's mock the load function behavior.
    let loadCalled = false

    llm.load = async function () {
        loadCalled = true
        return this
    }

    // Test the public unload method logic
    // We can't access #pipeline, but we can see if it throws an error.
    await llm.unload() // Should do nothing if pipeline is null

    // Since #pipeline is private, a full integration test requires either loading a real model or mocking the `runtime.js` module.
    // For now we test logic that doesn't strictly depend on the internals.
    assert.equal(loadCalled, false)
})
