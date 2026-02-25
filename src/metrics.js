import { TextStreamer } from "@huggingface/transformers";

/**
 * Custom streamer to track performance metrics during inference.
 */
export class MetricsStreamer extends TextStreamer {
  constructor(tokenizer, options) {
    super(tokenizer, options);
    this.startTime = 0;
    this.ttft = 0; // Time To First Token in milliseconds
    this.tokenCount = 0;
    this.hasFirstToken = false;
  }

  /**
   * Called when a new chunk of text is finalized.
   * @param {string} text - The finalized text chunk.
   */
  on_finalized_text(text) {
    if (!this.hasFirstToken && text.length > 0) {
      this.ttft = performance.now() - this.startTime;
      this.hasFirstToken = true;
    }
    super.on_finalized_text(text);
    // Count each finalized chunk as a token (typically 1:1 in streamers)
    this.tokenCount++;
  }

  /**
   * Calculates and logs performance metrics to the console.
   * 
   * Metrics calculated:
   * - TTFT (Time To First Token): Delay before the first token is generated.
   * - Prompt TPS: Processing speed of the input prompt tokens.
   * - Decoding TPS: Generation speed of the new tokens (tokens per second).
   * 
   * @param {number} totalDurationSec - Total duration of inference in seconds.
   * @param {number} promptTokens - Total number of tokens in the prompt.
   * @param {string} device - Hardware device used for inference (e.g., 'cpu', 'webgpu').
   * @param {string} dtype - Precision/quantization used for the model (e.g., 'q4', 'fp16').
   */
  logMetrics(totalDurationSec, promptTokens, device, dtype) {
    const ttftSec = this.ttft / 1000;
    // Decode duration is the time spent generating tokens after the first one.
    const decodeDuration = Math.max(0.001, totalDurationSec - ttftSec);
    // Prompt tokens per second (tok/s).
    const promptTps = ttftSec > 0 ? (promptTokens / ttftSec).toFixed(2) : "N/A";
    // Decoding tokens per second (tok/s).
    const decodingTps = (this.tokenCount / decodeDuration).toFixed(2);

    console.log(`\n\n--- Performance Metrics ---`);
    console.log(`Device:           ${device.toUpperCase()}`);
    console.log(`Precision:        ${dtype}`);
    console.log(`Prompt Tokens:    ${promptTokens} (${promptTps} tok/s)`);
    console.log(`Generated:        ${this.tokenCount} tokens (${decodingTps} tok/s)`);
    console.log(`TTFT:             ${ttftSec.toFixed(3)}s (Prompt processing)`);
    console.log(`Total Time:       ${totalDurationSec.toFixed(2)}s`);
    console.log(`---------------------------\n`);
  }
}
