/**
 * Shared ONNX runtime configuration.
 * Detects the execution environment and configures the appropriate backend:
 *   - Node.js → onnxruntime-node + filesystem cache
 *   - Browser → built-in WebGPU/WASM (handled by transformers.js)
 *
 * All downstream modules (model.js, Embedder.js) import from here
 * so environment setup runs exactly once.
 */

import { pipeline, env } from "@huggingface/transformers";

export const isNode = typeof process !== "undefined" && !!process.versions?.node;

if (isNode) {
  // Dynamic import prevents bundlers from resolving onnxruntime-node in browser builds.
  // Using a variable defeats static analysis for bundlers like esbuild.
  const ortPackage = "onnxruntime-node";
  const ort = await import(ortPackage);
  env.backends.onnx.runtime = ort.default ?? ort;
  env.cacheDir = "./.cache";
}

/**
 * Returns the best available compute device for the current environment.
 * Node.js always uses CPU. Browsers prefer WebGPU with CPU fallback.
 * @returns {Promise<string>} "webgpu" or "cpu"
 */
export async function getDevice() {
  if (!isNode && typeof navigator !== "undefined" && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        console.log("Using WebGPU for inference.");
        return "webgpu";
      }
    } catch (e) {
      console.warn("WebGPU detection failed:", e);
    }
  }
  return "cpu";
}

export { pipeline };
