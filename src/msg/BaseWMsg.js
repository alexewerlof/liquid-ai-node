import { isDef, isObj } from "jty"

const SUPPORTED_ROLES = ['system', 'user', 'assistant', 'tool']

export class BaseWMsg {
    #role

    static isBaseMsgObj(x, role) {
        if (isDef(role) && !SUPPORTED_ROLES.includes(role)) {
            throw new Error(`Unsupported role: ${role}`)
        }
        if (!isObj(x)) {
            return false
        }
        if (isDef(role)) {
            return x.role === role
        }
        return SUPPORTED_ROLES.includes(x.role)
    }

    constructor(role) {
        this.role = role
    }

    get role() {
        return this.#role
    }

    set role(role) {
        if (!SUPPORTED_ROLES.includes(role)) {
            throw new Error(`Unsupported role: ${role}`)
        }
        this.#role = role
    }

    toJSON() {
        return { role: this.role }
    }
}