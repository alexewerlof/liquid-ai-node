/**
 * Shared ONNX runtime configuration.
 * Centralizes environment setup so it runs exactly once.
 * Both model.js and embeddings.js import from here.
 */

import { pipeline, env } from "@huggingface/transformers";
import * as ort from "onnxruntime-node";

env.cacheDir = "./.cache";
env.backends.onnx.runtime = ort;

export { pipeline };
