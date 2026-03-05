import { isDef, isArr, isNum } from 'jty'

/**
 * Extracts the primary message block or text content from an LLM completion result.
 * Handles both plain strings, OpenAI-style nested message objects, and Transformers.js array structures.
 *
 * @param {any|any[]} completion The raw output returned by an LLM generation call.
 * @returns {any} The extracted message object, generated text string, or the original unchanged input.
 */
export function getFirstMessage(completion) {
    if (Array.isArray(completion) && completion.length > 0) {
        if (completion[0].generated_text && Array.isArray(completion[0].generated_text)) {
            return completion[0].generated_text.at(-1)
        }
        if (completion[0].message) {
            return completion[0].message // OpenAI format just in case
        }
    }
    return completion
}

/**
 * Determines whether a given message object represents a request from the assistant to call one or more tools.
 *
 * @param {object} message A message object (usually from an LLM response or session history).
 * @returns {boolean} True if the message contains valid tool calls, false otherwise.
 */
export function isToolsCallMessage(message) {
    if (!message) return false
    return isDef(message.tool_calls) && isArr(message.tool_calls) && message.tool_calls.length > 0
}

function simpleProgressBar(percent) {
    const filled = '█'.repeat(Math.round(percent / 10))
    const empty = '░'.repeat(10 - filled.length)
    return `${filled}${empty} ${percent.toFixed(2)}%`
}

/**
 * Callback function designed to handle progress events emitted by Transformers.js during model loading.
 * Logs informative console messages for file downloads and initialization phases.
 *
 * @param {object} progressObg An object detailing the current progress of a pipeline initialization step.
 * @param {string} [progressObg.name] The name of the file being processed.
 * @param {string} [progressObg.file] The specific file path or URL.
 * @param {string} progressObg.status The current status ('initiate', 'download', 'progress', 'ready', 'done').
 * @param {number} [progressObg.progress] The completion percentage if status is 'progress'.
 * @param {number} [progressObg.total] The total byte size expected.
 * @param {string} [progressObg.task] The overall pipeline task type (e.g. 'text-generation') when status is 'ready'.
 * @param {string} [progressObg.model] The model name being loaded when status is 'ready'.
 */
export function pipelineProgressReporter(progressObg) {
    // console.log('Progress event', progressObg);
    // A single name like 'Xenova/all-MiniLM-L6-v2' may initiate downloading and loading
    // multiple files like 'tokenizer_config.json', 'config.json', 'onnx/model_quantized.onnx', etc.
    // There can be repetitive events.
    // The value of `total` may change for the same file (usually it's the total size)
    const { name, file, status, progress, total, task, model } = progressObg

    switch (status) {
        case 'initiate':
            /**
             * The library has realized it needs a specific file and has started the process of fetching it.
             * This happens before any data transfer begins.
             * Defined: name, file
             */
            console.debug(`File Initiate:\nName: ${name}, File: ${file}`)
            break
        case 'download':
            /**
             * Fired at the start of the download.
             * Defined: name, file
             */
            console.debug(`File Download:\nName: ${name}, File: ${file}`)
            break
        case 'progress':
            /**
             * The file is being downloaded OR being transferred into memory.
             * Fired with progress=100 if the file is already downloaded
             * Defined: name, file, progress, total
             */
            console.debug(
                `File Progress:\nName: ${name}, File: ${file}, Progress: ${simpleProgressBar(progress)} Total: ${total}`,
            )
            break
        case 'ready':
            /**
             * A special final event. It signifies that all necessary files have been
             * loaded, parsed, and the model is fully initialized and ready for inference.
             * Defined: task, model
             */
            console.debug(`Task Ready:\nTask: ${task}, Model ${model}`)
            break
        case 'done':
            /**
             * The bytes for this individual file have been fully loaded into memory.
             * Defined: name, file
             */
            console.debug(`File Done:\nName: ${name}, File: ${file}`)
            break
        default:
            console.log(`Unknown status: ${status} in ${JSON.stringify(progressObg)}`)
    }
}

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @param {number} val The value to clamp.
 * @param {number} min The minimum allowed value.
 * @param {number} max The maximum allowed value.
 * @returns {number} The clamped value.
 */
export function clamp(val, min, max) {
    if (!isNum(val)) {
        throw new TypeError('val must be a number')
    }
    if (!isNum(min)) {
        throw new TypeError('min must be a number')
    }
    if (!isNum(max)) {
        throw new TypeError('max must be a number')
    }
    if (min > max) {
        throw new TypeError('min must be less than or equal to max')
    }
    return Math.min(Math.max(val, min), max)
}

/**
 * Converts seconds to milliseconds.
 *
 * @param {number} seconds The time in seconds.
 * @returns {number} The time in milliseconds.
 */
export function sec2ms(seconds) {
    if (!isNum(seconds)) {
        throw new TypeError('seconds must be a number')
    }
    return seconds * 1000
}
