import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { clamp, sec2ms } from './util.js'

test('clamp', () => {
    assert.equal(clamp(10, 5, 15), 10)
    assert.equal(clamp(20, 5, 15), 15)
    assert.equal(clamp(0, 5, 15), 5)
    assert.equal(clamp(15, 5, 15), 15)
    assert.equal(clamp(5, 5, 15), 5)
})

test('clamp exceptions', () => {
    assert.throws(() => clamp('a', 5, 15), TypeError)
    assert.throws(() => clamp(10, 'a', 15), TypeError)
    assert.throws(() => clamp(10, 5, 'a'), TypeError)
    assert.throws(() => clamp(10, 15, 5), TypeError)
})

test('sec2ms', () => {
    assert.equal(sec2ms(1), 1000)
    assert.equal(sec2ms(0), 0)
    assert.equal(sec2ms(30), 30000)
})

test('sec2ms exceptions', () => {
    assert.throws(() => sec2ms('a'), TypeError)
})
