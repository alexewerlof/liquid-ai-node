import { ContentWMsg } from "./ContentWMsg.js";

export class UserWMsg extends ContentWMsg {
    static isUserMsgObj(x) {
        return super.isBaseMsgObj(x, 'user')
    }

    constructor(...contents) {
        super('user', ...contents)
    }
}