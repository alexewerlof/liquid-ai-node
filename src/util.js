export function pipelineProgressReporter(progressObg) {
    // console.log('Progress event', progressObg);
    // A single name like 'Xenova/all-MiniLM-L6-v2' may initiate downloading and loading
    // multiple files like 'tokenizer_config.json', 'config.json', 'onnx/model_quantized.onnx', etc.
    // There can be repetitive events.
    // The value of `total` may change for the same file (usually it's the total size)
    const { name, file, status, progress, total, task, model } = progressObg

    switch (status) {
        case 'initiate':
            // Defined: name, file
            console.debug(`File Initiate:\nName: ${name}, File: ${file}`)
            break
        case 'download':
            // Fired at the start of the download/load
            // Defined: name, file
            console.debug(`File Download:\nName: ${name}, File: ${file}`)
            break
        case 'progress':
            // Fired with progress=100 if the file is already downloaded
            // Defined: name, file, progress, total
            console.debug(`File Progress:\nName: ${name}, File: ${file}, Progress: ${progress.toFixed(2)}% Total: ${total}`)
            break
        case 'ready':
            // Defined: task, model
            console.debug(`Task Ready:\nTask: ${task}, Model ${model}`);
            break
        case 'done':
            // Defined: name, file
            console.debug(`File Done:\nName: ${name}, File: ${file}`)
            break
        default:
            console.log(`Unknown status: ${status}`)
    }
}