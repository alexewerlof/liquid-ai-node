import { isStr } from "jty";
import { BaseWMsg } from "./BaseWMsg.js";

export class ContentWMsg extends BaseWMsg {
    #content = ''

    static isContentMessage(x) {
        if (!super.isBaseMsgObj(x)) {
            return false
        }
        return isStr(x.content)
    }

    constructor(role, ...contents) {
        super(role)
        this.append(...contents)
    }

    append(...contents) {
        for (const content of contents) {
            this.#content += String(content)
        }
    }

    get content() {
        return this.#content
    }

    set content(content) {
        if (!isStr(content)) {
            throw new TypeError(`Expected content to be a string, but got ${content} (${typeof content})`)
        }
        this.#content = content
    }

    toJSON() {
        const { role, content } = this
        return { role, content }
    }
}