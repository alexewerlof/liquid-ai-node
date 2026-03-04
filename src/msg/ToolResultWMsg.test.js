import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ToolResultWMsg } from './ToolResultWMsg.js';

describe('ToolResultWMsg', () => {
    test('should create valid OpenAI tool result message', () => {
        const msg = new ToolResultWMsg('call_123', { temp: 22 });
        const json = msg.toJSON();
        
        assert.equal(json.role, 'tool');
        assert.equal(json.tool_call_id, 'call_123');
        assert.equal(json.content, '{"temp":22}');
    });
});
