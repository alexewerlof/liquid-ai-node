import { pipeline, env } from '@huggingface/transformers'
env.allowRemoteModels = true

async function run() {
    console.time('First load')
    const p1 = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
    console.timeEnd('First load')

    console.time('Inference 1')
    await p1('hello')
    console.timeEnd('Inference 1')

    console.log('Disposing...')
    await p1.dispose()
    console.log('Disposed.')

    console.time('Second load')
    const p2 = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
    console.timeEnd('Second load')

    console.time('Inference 2')
    try {
        await p2('hello')
        console.timeEnd('Inference 2')
    } catch (e) {
        console.error('Error on second inference:', e.message)
    }
}
run()
