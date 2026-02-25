# Liquid AI Node.js Explorer

An interactive CLI application that uses `@huggingface/transformers` and `onnxruntime-node` to run Liquid AI models locally with high-performance metrics.

## Features
- **Local Inference:** Runs text generation models directly on your hardware using ONNX.
- **Interactive Chat:** Simple terminal-based chat interface.
- **Performance Metrics:** Real-time tracking of Time To First Token (TTFT), tokens per second (TPS), and device usage.
- **Quantization Support:** Defaults to 4-bit (q4) for memory-efficient execution.

## Prerequisites
- **Node.js:** v18 or later.
- **Hugging Face Token:** Required for downloading gated or private models.
  - Set as `HUGGINGFACE_TOKEN` in your environment.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd liquid-ai-node
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

Start the interactive chat with the default model:
```bash
npm start
```

### Configuration Overrides
You can override default settings using environment variables:
- `MODEL_ID`: Hugging Face model ID (default: `onnx-community/LFM2-1.2B-ONNX`).
- `DTYPE`: Precision/quantization level (default: `q4`).
- `CACHE_DIR`: Local path for model storage (default: `./.cache`).

Example:
```bash
DTYPE=fp16 npm start
```

## Performance Metrics
During each response, the application provides detailed performance data:
- **Device:** Hardware used (CPU/WebGPU).
- **Precision:** Model quantization level.
- **Prompt Tokens:** Total tokens in the prompt and processing speed.
- **Generated:** Total tokens generated and decoding speed.
- **TTFT:** Time to first token (prompt processing latency).
- **Total Time:** End-to-end duration for the request.

## License
ISC
