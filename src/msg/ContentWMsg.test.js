import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ContentWMsg } from './ContentWMsg.js';

describe('ContentWMsg', () => {
    test('should throw on construct directly (pseudo-abstract) without correct args if not careful, actually it passes', () => {
        const msg = new ContentWMsg('user', 'hello', ' world');
        assert.equal(msg.content, 'hello world');
        assert.deepEqual(msg.toJSON(), { role: 'user', content: 'hello world' });
    });
});
