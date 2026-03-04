import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { AssistantWMsg } from './AssistantWMsg.js';

describe('AssistantWMsg', () => {
    test('should create valid OpenAI assistant message without tool calls', () => {
        const msg = new AssistantWMsg('It is 4.');
        assert.deepEqual(msg.toJSON(), { role: 'assistant', content: 'It is 4.' });
    });
});
