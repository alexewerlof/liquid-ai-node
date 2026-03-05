import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { BaseWMsg } from './BaseWMsg.js'

describe('BaseWMsg', () => {
    test('should construct with valid role', () => {
        const msg = new BaseWMsg('user')
        assert.equal(msg.role, 'user')
        assert.deepEqual(msg.toJSON(), { role: 'user' })
    })

    test('should throw on invalid role', () => {
        assert.throws(() => new BaseWMsg('invalid'), { message: 'Unsupported role: invalid' })
    })

    test('isBaseMsgObj detects valid objects', () => {
        assert.equal(BaseWMsg.isBaseMsgObj({ role: 'user' }, 'user'), true)
        assert.equal(BaseWMsg.isBaseMsgObj({ role: 'system' }), true)
        assert.equal(BaseWMsg.isBaseMsgObj({ role: 'invalid' }), false)
    })
})
