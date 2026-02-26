# Agent Guidelines: Liquid AI Node.js & Browser Integration

This document defines requirements and best practices for AI agents working in this repo for feasibility testing of Liquid AI models.

## Core Mandates

### Reason for approval
**ALWAYS** clarify why you need permission to execute commands. If something is not clear, ask the user. Do **not** assume intent.

### Task Scope: Chat & Embeddings
- **Feasibility Testing:** This repo is used to validate `@huggingface/transformers` (Transformers.js) for both **Text Generation (Chat)** and **Feature Extraction (Embeddings)**.
- **Model Support:** Prioritize Liquid AI models like `onnx-community/LFM2-1.2B-ONNX` for chat and appropriate Liquid models for embeddings once identified.

### Environment & Portability
- **Node.js vs Browser:** The same logic should ideally be portable between Node.js (current feasibility testing) and the Browser (target distribution).
- **Library:** Exclusively use `@huggingface/transformers` (Transformers.js v3+) for ONNX-based inference.
- **Hardware Acceleration:** 
  - **Node.js:** Use `onnxruntime-node` for performance where available.
  - **Browser:** Support **WebGPU** (primary) and **WASM** (fallback/compatibility). 
  - Ensure code handles environment differences gracefully (e.g., conditional imports or environment checks).
- **Environment Stability:** Configure `env.cacheDir` to a local directory (default: `./.cache`) in Node.js for reliable, offline-first model access.

### Performance & Efficiency
- **Memory Management:** Be mindful of V8 and browser memory limits when loading models. Use streaming or targeted token limits (e.g., `max_new_tokens`) where appropriate.
- **Metrics Tracking:** Maintain metrics like TTFT (Time To First Token) and TPS (Tokens Per Second) to compare performance across environments.

### Coding Standards
- **ESM Modules:** This project uses `"type": "module"`. Use `import/export` only.
- **Asynchronous Execution:** Model loading and inference are inherently asynchronous. Ensure proper `async/await` patterns with robust error handling for OOM or network failures.

## Logging & Feedback
- **Download Progress:** Do not suppress the library's built-in progress bars or logs during initial model downloads. Use `console.debug()` for additional insights during the loading phase.
- **Inference Latency:** Log model load times and inference duration to monitor performance regressions.
- **Error handling:** In case of error, provide a descriptive error message explaining what went wrong and how it might relate to the environment (Node/Browser).

## Modification Guidelines
- When adding embedding support, ensure the same architecture is used as the chat implementation for consistency.
- Verify any added dependencies are compatible with both Node.js and modern browsers.

## References
- [Liquid AI Documentation](https://liquid.ai/)
- [Hugging Face Transformers.js Docs](https://huggingface.co/docs/transformers.js/)
- [ONNX Runtime Web/Node](https://onnxruntime.ai/docs/api/js/index.html)
