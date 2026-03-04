import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
    parsePythonToolCall,
    formatToolsForLFM2,
    formatMessagesForLFM2,
} from './LFMTransformerLLM.js'

describe('LFM2 Parser Functions', () => {
    describe('parsePythonToolCall', () => {
        test('should return null for non-tool call format', () => {
            assert.equal(parsePythonToolCall('just some text'), null)
            assert.equal(parsePythonToolCall('[not a valid format'), null)
        })

        test('should parse a tool call with no arguments', () => {
            const result = parsePythonToolCall('[get_time()]')
            assert.ok(result)
            assert.equal(result.length, 1)
            assert.equal(result[0].function.name, 'get_time')
            assert.equal(result[0].function.arguments, '{}')
        })

        test('should parse a tool call with string arguments', () => {
            const result = parsePythonToolCall('[get_temp(loc="Paris")]')
            assert.ok(result)
            assert.equal(result.length, 1)
            assert.equal(result[0].function.name, 'get_temp')
            assert.deepEqual(JSON.parse(result[0].function.arguments), {
                loc: 'Paris',
            })
        })

        test('should strip stray tokens from the text', () => {
            const result = parsePythonToolCall(
                '<|tool_call_start|>[ping()]<|tool_call_end|>',
            )
            assert.ok(result)
            assert.equal(result[0].function.name, 'ping')
            assert.equal(result[0].function.arguments, '{}')
        })
    })

    describe('formatToolsForLFM2', () => {
        test('should extract the inner function object from a tool array', () => {
            const tools = [
                {
                    type: 'function',
                    function: { name: 'get_time', description: 'Returns time' },
                },
            ]
            const formatted = formatToolsForLFM2(tools)
            assert.equal(formatted.length, 1)
            assert.deepEqual(formatted[0], tools[0].function)
        })

        test('should handle undefined or non-array inputs gracefully', () => {
            assert.equal(formatToolsForLFM2(null), undefined)
            assert.equal(formatToolsForLFM2({}), undefined)
        })
    })

    describe('formatMessagesForLFM2', () => {
        test('should serialize assistant tool calls into pythonic strings', () => {
            const messages = [
                {
                    role: 'assistant',
                    tool_calls: [
                        {
                            type: 'function',
                            function: {
                                name: 'get_temp',
                                arguments: '{"loc":"Paris"}',
                            },
                        },
                    ],
                },
            ]

            const formatted = formatMessagesForLFM2(messages)
            assert.equal(formatted.length, 1)
            assert.equal(formatted[0].role, 'assistant')
            assert.equal(formatted[0].content, '[get_temp(loc="Paris")]')
        })

        test('should leave normal messages untouched', () => {
            const messages = [{ role: 'user', content: 'hello' }]
            const formatted = formatMessagesForLFM2(messages)
            assert.deepEqual(formatted, messages)
        })
    })
})
