import { ContentWMsg } from "./ContentWMsg.js";

export class SystemMessage extends ContentWMsg {
    static isSystemMsgObj(x) {
        return super.isBaseMsgObj(x, 'system')
    }

    constructor(...contents) {
        super('system', ...contents)
    }
}