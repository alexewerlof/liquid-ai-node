import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { SystemMessage } from './SystemMessage.js';

describe('SystemMessage', () => {
    test('should create valid OpenAI system message', () => {
        const msg = new SystemMessage('You are a helpful assistant.');
        assert.deepEqual(msg.toJSON(), { role: 'system', content: 'You are a helpful assistant.' });
    });
});
