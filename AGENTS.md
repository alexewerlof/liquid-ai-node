# Agent Guidelines: Liquid AI Node.js Integration

This document defines requirements and best practices for AI agents working in this repo.

## Core Mandates

### Reason for approval

**ALWAYS** clarify why you need permission to execute commands.

If something is not clear, ask the user. Do **not** assume intent.

### Model & Runtime Management
- **Library:** Exclusively use `@huggingface/transformers` (Transformers.js) for ONNX-based inference in Node.js.
- **Model Support:** Prioritize Liquid AI models like `onnx-community/LFM2-1.2B-ONNX`.
- **Environment Stability:** Always configure `env.cacheDir` to a local directory (default: `./.cache`) for reliable, offline-first model access.

### Performance & Efficiency
- **Memory Management:** Be mindful of V8 heap limits when loading large ONNX models. Use streaming or targeted token limits (e.g., `max_new_tokens`) where appropriate.
- **Hardware Acceleration:** When supported by the environment, prefer WebGPU or WASM backends for inference performance.

### Coding Standards
- **ESM Modules:** This project uses `"type": "module"`. Use `import/export` only.
- **Asynchronous Execution:** Model loading and inference are inherently asynchronous. Ensure proper `async/await` patterns with robust error handling for OOM or network failures during download.

## Logging & Feedback
- **Download Progress:** Do not suppress the library's built-in progress bars or logs during initial model downloads. If possible, use Transformers.js features to console.debug() the download process as well and the process to load the model to memory.
- **Inference Latency:** Log model load times and inference duration to monitor performance regressions.
- **Error handling:** in case of error, provide a descriptive error message to help the user understand what went wrong, why, and how to fix it.

## Modification Guidelines
- When adding new pipelines (e.g., embeddings, classification), verify the Liquid model's specific ONNX export supports the task.
- Ensure any added dependencies are compatible with the current Node.js and Transformers.js versions.

## References
- [Liquid AI Documentation](https://liquid.ai/)
- [Hugging Face Transformers.js Docs](https://huggingface.co/docs/transformers.js/)
- [ONNX Runtime Node.js](https://onnxruntime.ai/docs/api/js/index.html)
