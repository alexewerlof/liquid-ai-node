import { isDef, isArr } from 'jty';

export function getFirstMessage(completion) {
    if (Array.isArray(completion) && completion.length > 0) {
        if (completion[0].generated_text && Array.isArray(completion[0].generated_text)) {
            return completion[0].generated_text.at(-1);
        }
        if (completion[0].message) {
            return completion[0].message; // OpenAI format just in case
        }
    }
    return completion;
}

export function isToolsCallMessage(message) {
    if (!message) return false;
    return isDef(message.tool_calls) && isArr(message.tool_calls) && message.tool_calls.length > 0;
}

function simpleProgressBar(percent) {

    const filled = '█'.repeat(Math.round(percent / 10));
    const empty = '░'.repeat(10 - filled.length);
    return `${filled}${empty} ${percent.toFixed(2)}%`;
}

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
            console.debug(`File Progress:\nName: ${name}, File: ${file}, Progress: ${simpleProgressBar(progress)} Total: ${total}`)
            break
        case 'ready':
            /**
             * A special final event. It signifies that all necessary files have been
             * loaded, parsed, and the model is fully initialized and ready for inference.
             * Defined: task, model
             */
            console.debug(`Task Ready:\nTask: ${task}, Model ${model}`);
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