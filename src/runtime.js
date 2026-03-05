/**
 * Shared ONNX runtime configuration.
 * Detects the execution environment and configures the appropriate backend:
 *   - Node.js → onnxruntime-node + filesystem cache
 *   - Browser → built-in WebGPU/WASM (handled by transformers.js)
 *
 * All downstream modules (model.js, Embedder.js) import from here
 * so environment setup runs exactly once.
 */

import { pipeline, env } from '@huggingface/transformers'
import { pipelineProgressReporter } from './util.js'

/*
 * Tips for future development:
 * Disable the loading of remote models from the Hugging Face Hub:
 * env.allowRemoteModels = false;
 *
 * Set location of .wasm files. Defaults to use a CDN.
 * env.backends.onnx.wasm.wasmPaths = '/path/to/files/';
 *
 * By default, unless you pass { local_files_only: true }, transformers.js will send a tiny,
 * lightweight HEAD request to the Hugging Face Hub to check the ETag of the file.
 * If the cache is still up to date, it instantly falls back to reading from the local cache,
 * firing the "initiated" -> "download" -> "progress" (instantly 100%) -> "done" events.
 * Specify a custom location for models (defaults to '/models/').
 * env.localModelPath = "/huggingface";
 */

export const isNode = typeof process !== 'undefined' && !!process.versions?.node

if (isNode) {
    // Dynamic import prevents bundlers from resolving onnxruntime-node in browser builds.
    // Using a variable defeats static analysis for bundlers like esbuild.
    const ortPackage = 'onnxruntime-node'
    const ort = await import(ortPackage)
    env.backends.onnx.runtime = ort.default ?? ort
    env.cacheDir = './.cache'
}

/**
 * Returns the best available compute device for the current environment.
 * Node.js always uses CPU. Browsers prefer WebGPU with CPU fallback.
 * @returns {Promise<string>} "webgpu" or "cpu"
 */
export async function getDevice() {
    try {
        const adapter = await navigator?.gpu?.requestAdapter()
        return adapter ? 'webgpu' : 'cpu'
    } catch (e) {
        return 'cpu'
    }
}

export async function createPipeline(task, model, options = {}) {
    const device = await getDevice()
    console.debug(`Creating pipeline for task ${task} and model ${model} on device ${device}`)
    return await pipeline(task, model, {
        device,
        progress_callback: pipelineProgressReporter,
        ...options,
    })
}
