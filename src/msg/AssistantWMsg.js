import { ContentWMsg } from "./ContentWMsg.js";

export class AssistantWMsg extends ContentWMsg {
    static isAssistantMsgObj(x) {
        return super.isBaseMsgObj(x, 'assistant')
    }

    constructor(...contents) {
        super('assistant', ...contents)
    }
}