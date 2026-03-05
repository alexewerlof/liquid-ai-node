import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { ToolCallsWMsg } from './ToolCallsWMsg.js'

describe('ToolCallsWMsg', () => {
    test('should create valid OpenAI assistant message with tool calls', () => {
        const toolCalls = [
            {
                id: 'call_123',
                type: 'function',
                function: {
                    name: 'get_weather',
                    arguments: '{"location":"Paris"}',
                },
            },
        ]
        const msg = new ToolCallsWMsg(toolCalls)
        const json = msg.toJSON()

        assert.equal(json.role, 'assistant')
        assert.deepEqual(json.tool_calls, toolCalls)
    })

    test('isToolCallObj validates OpenAI tool call structure', () => {
        const goodToolCall = {
            id: 'call_123',
            type: 'function',
            function: {
                name: 'fn',
                arguments: '{}',
            },
        }
        assert.equal(ToolCallsWMsg.isToolCallObj(goodToolCall), true)

        const badToolCall = { id: '123' }
        assert.equal(ToolCallsWMsg.isToolCallObj(badToolCall), false)
    })
})
