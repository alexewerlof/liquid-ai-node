# Agent Guidelines: Liquid AI Node.js & Browser Integration

This document defines requirements and conventions for AI agents working in this repo. It is designed to be understood by any AI coding agent (Claude, GPT, Gemini, Copilot, etc.). Follow every instruction literally.

## Project Overview

This repo is a feasibility test for running Liquid AI models via `@huggingface/transformers` (Transformers.js v3+). It supports both **text generation (chat)** and **feature extraction (embeddings / RAG)**.

### Key Files

| File | Purpose |
|---|---|
| `index.js` | Entry point — initializes model and starts interactive chat |
| `src/config.js` | Shared configuration: cache dir, model IDs, generation params |
| `src/model.js` | Model loading via Transformers.js |
| `src/chat.js` | Interactive chat loop with streaming |
| `src/rag.js` | RAG pipeline: load content, embed, retrieve context |
| `src/embeddings.js` | Embedding model wrapper |
| `src/vector_store.js` | In-memory vector store for similarity search |
| `src/metrics.js` | TTFT / TPS performance metrics |

---

## Interaction Rules

- **Ask before acting.** Always clarify why you need permission to execute a command. Do not assume intent.
- **Stay in scope.** Only modify code related to the current task. Do not refactor unrelated files unless asked.
- **Keep `AGENTS.md` up to date.** Whenever you add, remove, or change code (files, exports, dependencies, behavior), update this document to reflect the change. This serves two purposes:
  1. It gives the user a human-readable summary of what changed and why.
  2. It enables knowledge handover — another agent or a future session can read this file and immediately understand the current state of the project.

---

## JavaScript Coding Conventions

These conventions apply to **all** JavaScript code generated or modified in this repo.

### Pure Functions First

- Prefer pure functions with explicit inputs and outputs.
- A function's behavior must be fully determined by its arguments — no hidden state, no side effects unless the function's purpose is a side effect (e.g., logging, I/O).
- This makes functions easy to test with **table-driven tests** (an array of `{ input, expected }` pairs).

### Keep Functions Small

- Each function should do **one thing**.
- Use `switch...case` with `return` or `throw` inside each case to encapsulate complex decision logic. Do not let cases fall through.
- The sweet spot for a function body is **2–10 lines**. When a function grows beyond that, look for opportunities to extract helpers.

### Extract Common Logic

- When two or more functions share a pattern, extract the shared part into a named helper.
- Name helpers after **what** they do, not **where** they are used.

### Classes Only When Stateful

- Default to plain functions and module-level exports.
- Only use a `class` when:
  1. The logic is inherently stateful, **and**
  2. Passing that state between multiple related functions would make the code unnecessarily complex.

### Modern JavaScript Features

Use the latest stable features available in current Node.js (v22+) and modern browsers:

- `#privateProperties` for class encapsulation
- ESM (`import` / `export`) — this project uses `"type": "module"`
- Getters / setters where they simplify the API
- `async` / `await` for all asynchronous code
- Generators / iterators where lazy evaluation is appropriate
- `Object.freeze()` for immutable config objects
- Optional chaining (`?.`) and nullish coalescing (`??`)
- `structuredClone()` over `JSON.parse(JSON.stringify())`

### Error Handling

- Provide descriptive error messages explaining **what** went wrong and **why** it might have happened (e.g., environment differences between Node and Browser).
- Use `try...catch` around model loading and inference — these can fail due to OOM, missing models, or network issues.

### Documentation

- Add a JSDoc comment (with `@param` and `@returns` tags including types) above every exported function.
- **Keep JSDoc and type annotations in sync with the code.** Every change to a function's signature, return type, or behavior must be reflected in its JSDoc immediately — do not leave stale documentation.
- Use inline comments only to explain **why**, not **what**.

---

## Environment & Portability

- **Dual-target.** Code should be portable between Node.js and the browser wherever feasible.
- **Library.** Use only `@huggingface/transformers` (Transformers.js v3+) for ONNX inference.
- **Hardware acceleration:**
  - Node.js → `onnxruntime-node`
  - Browser → WebGPU (primary), WASM (fallback)
  - Handle environment differences gracefully (conditional imports or runtime checks).
- **Cache.** Set `env.cacheDir` to `./.cache` in Node.js for offline-first model access.

---

## Performance & Metrics

- Be mindful of V8 / browser memory limits when loading models.
- Use `max_new_tokens` and streaming to control memory pressure.
- Track and log **TTFT** (Time To First Token) and **TPS** (Tokens Per Second).
- Log model load times and inference duration to catch regressions.

---

## Logging

- Do **not** suppress the library's built-in download progress bars.
- Use `console.debug()` for additional diagnostic output during model loading.
- On errors, log a message that explains the failure in context.

---

## Modification Guidelines

- When adding new capabilities, follow the existing module structure (`src/<feature>.js`).
- Verify that any new dependency is compatible with both Node.js and modern browsers.
- Keep `src/config.js` as the single source of truth for model IDs, generation params, and paths.

---

## References

- [Liquid AI Documentation](https://liquid.ai/)
- [Hugging Face Transformers.js Docs](https://huggingface.co/docs/transformers.js/)
- [ONNX Runtime Web/Node](https://onnxruntime.ai/docs/api/js/index.html)
