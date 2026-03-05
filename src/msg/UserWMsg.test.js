import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { UserWMsg } from './UserWMsg.js'

describe('UserWMsg', () => {
    test('should create valid OpenAI user message', () => {
        const msg = new UserWMsg('What is 2+2?')
        assert.deepEqual(msg.toJSON(), { role: 'user', content: 'What is 2+2?' })
    })
})
