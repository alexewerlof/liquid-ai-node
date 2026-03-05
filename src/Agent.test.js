import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { Agent } from './Agent.js'
import { Session } from './Session.js'
import { TransformerLLM } from './TransformersLLM.js'
import { Toolbox } from './Toolbox.js'

class MockLLM extends TransformerLLM {
    constructor() {
        super()
        this.responses = []
        this.callCount = 0
    }

    async complete() {
        if (this.callCount >= this.responses.length) {
            return [{ message: { role: 'assistant', content: 'Out of responses mock' } }]
        }
        return this.responses[this.callCount++]
    }
}

describe('Agent', () => {
    test('should resolve without tools calls normally', async () => {
        const llm = new MockLLM()
        llm.responses.push([{ message: { role: 'assistant', content: 'hello world' } }])
        const session = new Session()
        const agent = new Agent(llm, session)
        const bead = await agent.complete()
        assert.equal(bead.content, 'hello world')
        assert.equal(session.messages.length, 1)
    })

    test('should invoke tools and loop up to MAX_CALLS', async () => {
        const llm = new MockLLM()
        const toolbox = new Toolbox()
        toolbox
            .addTool('get_temp', 'get temperature')
            .fn(() => ({ temp: 22 }))
            .prm('loc: string*', 'location')

        llm.responses.push([
            {
                generated_text: [
                    {
                        role: 'assistant',
                        content: '',
                        tool_calls: [
                            {
                                id: 'call_1',
                                type: 'function',
                                function: { name: 'get_temp', arguments: '{"loc":"Paris"}' },
                            },
                        ],
                    },
                ],
            },
        ])
        llm.responses.push([
            {
                generated_text: [{ role: 'assistant', content: 'The temp is 22.' }],
            },
        ])

        const session = new Session()
        const agent = new Agent(llm, session, toolbox)
        const bead = await agent.complete()

        assert.equal(bead.role, 'assistant')
        assert.equal(bead.content, 'The temp is 22.')
        assert.equal(session.messages.length, 3)
        // 1. the tool calls message
        // 2. the tool result message
        // 3. the final assistant message
        assert.equal(session.messages[0].role, 'assistant')
        assert.equal(session.messages[1].role, 'tool')
        assert.equal(session.messages[2].role, 'assistant')
    })

    test('should throw if max consecutive tool calls exceeded', async () => {
        const llm = new MockLLM()
        const toolbox = new Toolbox()
        toolbox.addTool('ping', 'ping').fn(() => 'pong')

        // Return a tool call infinitely
        const generateToolCall = () => [
            {
                generated_text: [
                    {
                        role: 'assistant',
                        content: '',
                        tool_calls: [{ id: 'call_x', type: 'function', function: { name: 'ping', arguments: '{}' } }],
                    },
                ],
            },
        ]

        // Pushing 10 of these, way past MAX_CALLS
        for (let i = 0; i < 10; i++) {
            llm.responses.push(generateToolCall())
        }

        const session = new Session()
        const agent = new Agent(llm, session, toolbox)
        await agent.complete()

        // The last message in the session must be a SystemMessage wrapping the error.
        const lastMsg = session.messages.at(-1)
        assert.equal(lastMsg.role, 'system')
        assert.ok(lastMsg.content.includes('too many tool calls (max='))
    })
})
