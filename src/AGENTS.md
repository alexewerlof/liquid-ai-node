This directory contains abstractions for building agentic systems and working with local or remote LLMs.
Each class it put in a file with the corresponding name.
All classes, methods and function should have up to date JSDoc comments.

### Core Entities

- `Agent` is an entity that has an LLM and a Toolbox.
- `TransformersLLM` is an LLM implementation that uses the Hugging Face Transformers library and runs in Node or the Browser with the fastest available runtime (CPU/GPU).
- `Toolbox` contains `Tool`s.
- Each `Tool` is a function with descriptions, parameters, and return types.
- `Session` is a conversation between an `Agent` and a user.

### Knowledge & RAG

- `RAG` orchestrates the Retrieval-Augmented Generation pattern using `Embedder` and `VectorStore`.
- `Embedder` is an entity that can embed text into a vector space.
- `VectorStore` is an entity that can store and retrieve vectors.
- `ingest.js` is a utility for loading local files, chunking them, and indexing them into the `VectorStore`.

### Messaging & State

- `msg/` directory contains wrapper classes (e.g., `SystemMessage`, `ToolCallsWMsg`) that format interactions to comply with the standard OpenAI API message schema. (See `msg/AGENTS.md` for details).

### Runtime & Configuration

- `runtime.js` manages environmental differences, ensuring models run cleanly across Node.js (via `onnxruntime-node`) and the Browser (via WebGPU/WASM).
- `config.js` contains the global application configuration, such as target model IDs, generation parameters, and the default system prompt.
