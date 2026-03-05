import { isDef, isObj } from 'jty'

const SUPPORTED_ROLES = ['system', 'user', 'assistant', 'tool']

/**
 * The base class for all conversation message objects.
 * Maintains the foundational `role` property shared across all messages.
 */
export class BaseWMsg {
    /**
     * The private backing field for the message's role.
     * @type {string}
     */
    #role

    /**
     * Checks whether an object is a structurally valid BaseWMsg format.
     * Optionally enforces a specific `role` validation.
     *
     * @param {any} x The object to evaluate.
     * @param {string} [role] An optional role string to mandate.
     * @returns {boolean} True if the object matches the criteria, false otherwise.
     * @throws {Error} If the provided role constraint is not a supported role type.
     */
    static isBaseMsgObj(x, role) {
        if (isDef(role) && !SUPPORTED_ROLES.includes(role)) {
            throw new Error(`Unsupported role: ${role}`)
        }
        if (!isObj(x)) {
            return false
        }
        // @ts-ignore
        if (isDef(role)) {
            // @ts-ignore
            return x.role === role
        }
        // @ts-ignore
        return SUPPORTED_ROLES.includes(x.role)
    }

    /**
     * Initializes a new BaseWMsg object with a specified role.
     *
     * @param {string} role The role ID describing the origin of the message (e.g., 'user', 'assistant').
     */
    constructor(role) {
        this.role = role
    }

    /**
     * Retrieves the role assigned to this message.
     * @returns {string} The role ID string.
     */
    get role() {
        return this.#role
    }

    /**
     * Ensures and sets the assigned role of the message.
     * @param {string} role The role string to set.
     * @throws {Error} If the assigned role goes beyond the SUPPORTED_ROLES constraint.
     */
    set role(role) {
        if (!SUPPORTED_ROLES.includes(role)) {
            throw new Error(`Unsupported role: ${role}`)
        }
        this.#role = role
    }

    /**
     * Gets a plain object representation of the message tailored for JSON conversion.
     *
     * @returns {{role: string}} A plain serialized message object.
     */
    toJSON() {
        return { role: this.role }
    }
}
