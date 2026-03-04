import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Session } from './Session.js';
import { UserWMsg } from './msg/UserWMsg.js';
import { AssistantWMsg } from './msg/AssistantWMsg.js';

describe('Session', () => {
    test('should initialize empty', () => {
        const session = new Session();
        assert.equal(session.messages.length, 0);
    });

    test('should initialize with system prompt', () => {
        const session = new Session('System instruction');
        assert.equal(session.messages.length, 1);
        assert.equal(session.messages[0].content, 'System instruction');
        assert.equal(session.messages[0].role, 'system');
    });

    test('should add messages', () => {
        const session = new Session();
        const msg = new UserWMsg('hello');
        session.addWMsg(msg);
        assert.equal(session.messages.length, 1);
        assert.equal(session.messages[0].content, 'hello');
    });

    test('toMessages outputs array of standard json objects', () => {
        const session = new Session('You are a bot');
        session.addWMsg(new UserWMsg('Hi'));
        session.addWMsg(new AssistantWMsg('Hello!'));
        const msgs = session.toMessages();
        assert.deepEqual(msgs, [
            { role: 'system', content: 'You are a bot' },
            { role: 'user', content: 'Hi' },
            { role: 'assistant', content: 'Hello!' }
        ]);
    });
});
