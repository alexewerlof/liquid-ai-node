import { isFn, isStr } from 'jty'

/**
 * Describes the properties of a tool's parameters.
 * It's an object where each key is a parameter name.
 * @typedef {Object<string, {type: string, description: string}>} ToolProperties
 */

/**
 * Describes the parameter structure for a tool.
 * @typedef {object} ToolParameters
 * @property {'object'} type - The type of the parameters object, always 'object'.
 * @property {ToolProperties} properties - The individual parameter properties.
 * @property {string[]} required - An array of names of required parameters.
 * @property {boolean} additionalProperties - Whether additional properties are allowed.
 */

/**
 * Describes the function part of a tool description.
 * @typedef {object} ToolFunctionDescriptor
 * @property {string} name - The name of the function.
 * @property {string} description - A description of what the function does.
 * @property {ToolParameters} parameters - The parameters the function accepts.
 * @property {boolean} strict - A flag for strict mode handling (interpretation depends on the consumer).
 */

/**
 * The full description of a tool, formatted for an LLM or similar system.
 * @typedef {object} ToolDescriptor
 * @property {'function'} type - The type of the tool, always 'function'.
 * @property {ToolFunctionDescriptor} function - The description of the function.
 */

/**
 * Describes a single property (parameter) of a tool.
 * @typedef {object} ToolProperty
 * @property {string} name - The name of the parameter.
 * @property {string} type - The data type of the parameter (e.g., 'string', 'number', 'boolean').
 * @property {string} description - A description of the parameter.
 * @property {boolean} required - Whether this parameter is required.
 */

/**
 * Parses a shorthand string description of a parameter into a typed property object.
 * Shorthand format: "name : type[*]"
 * Examples: "id : string*", "tags : string[]", "count : number"
 *
 * @param {string} paramShorthand The shorthand string to parse.
 * @returns {{name: string, type: string, required: boolean, itemsType?: string}} The parsed property object.
 * @throws {TypeError|SyntaxError} If the input string is structurally invalid or unparseable.
 */
export function parseParamShorthand(paramShorthand) {
    if (!isStr(paramShorthand)) {
        throw new TypeError(`Expected paramShorthand to be a string. Got ${paramShorthand}`)
    }

    const parts = paramShorthand.split(':')
    if (parts.length !== 2) {
        throw new SyntaxError(`Invalid paramShorthand format: ${paramShorthand}`)
    }

    const name = parts[0].trim()
    if (name.length === 0) {
        throw new SyntaxError(`Invalid paramShorthand name: ${paramShorthand}`)
    }

    const typeAndRequired = parts[1].trim()

    const required = typeAndRequired.endsWith('*')
    const type = required ? typeAndRequired.slice(0, -1).trim() : typeAndRequired.trim()
    const isArray = type.endsWith('[]')
    if (isArray) {
        const itemsType = type.slice(0, -2).trim()
        if (itemsType.length === 0) {
            throw new SyntaxError(`Invalid paramShorthand array type: ${paramShorthand}`)
        }
        return { name, type: 'array', required, itemsType }
    }
    if (type.length === 0) {
        throw SyntaxError(`Invalid paramShorthand type: ${paramShorthand}`)
    }

    return { name, type, required }
}

/**
 * A builder class for defining tools that can be executed by LLMs.
 * Fluently define the tool name, description, parameters, and the function mapping.
 */
export class Tool {
    /** The value of this inside the function when it is invoked */
    thisArg = undefined

    /**
     * An array of descriptions for each parameter the tool's function accepts.
     * @type {ToolProperty[]}
     */
    properties = []

    /**
     * The actual JavaScript function to be executed.
     * This property is read-only after initialization.
     * @readonly
     * @type {Function}
     */
    func

    /**
     * A description of what the tool does.
     * @type {string}
     */
    description

    /**
     * Indicates if the function parameters allow additional properties not explicitly defined.
     * @type {boolean}
     */
    additionalProperties = false

    /**
     * A flag for strict mode adherence, typically for schema validation by the LLM.
     * @type {boolean}
     */
    strict = false

    /**
     * Initializes a new Tool instance with a name and a description.
     *
     * @param {string} name The unique identifier for the tool.
     * @param {...string} description One or more strings describing what the tool does (they will be concatenated).
     * @throws {TypeError} If the tool name is not a string.
     */
    constructor(name, ...description) {
        if (!isStr(name)) {
            throw new TypeError(`Expected tool name to be a string. Got ${name}`)
        }
        this.name = name

        this.description = description.join(' ')
    }

    /**
     * Attaches the JavaScript function to be executed when the tool is invoked.
     *
     * @param {Function} func The target function to call. It usually accepts an object argument.
     * @returns {this} The tool instance for chaining.
     * @throws {TypeError} If `func` is not a function.
     */
    fn(func) {
        if (!isFn(func)) {
            throw new TypeError(`Expected tool func to be a function. Got ${func}`)
        }
        this.func = func
        return this
    }

    /**
     * Sets the `this` context to be used when the tool's function is invoked.
     *
     * @param {*} thisArg The object to use as the `this` context.
     * @returns {this} The tool instance for chaining.
     */
    this(thisArg) {
        this.thisArg = thisArg
        return this
    }

    /**
     * Indicates whether the underlying function accepts parameters not explicitly defined.
     *
     * @param {boolean} value True to allow additional properties, false otherwise.
     * @returns {this} The tool instance for chaining.
     */
    hasAdditionalProperties(value) {
        this.additionalProperties = Boolean(value)
        return this
    }

    /**
     * Sets whether strict mode tracking should be enabled. Often used for JSON schema validation enforcements by LLMs.
     *
     * @param {boolean} value True to enforce strict mode, false otherwise.
     * @returns {this} The tool instance for chaining.
     */
    strictMode(value) {
        this.strict = Boolean(value)
        return this
    }

    /**
     * Invokes the tool's function with the given arguments.
     * Arguments are expected to be a JSON string representing an object.
     * @param {string} argsStr - A JSON string representing the arguments object for the function.
     * @returns {Promise<string>} A promise that resolves to a string representation of the function's result.
     */
    async invoke(argsStr) {
        try {
            if (!isFn(this.func)) {
                throw new TypeError(`Tool ${this.name} hasn't defined a function body.`)
            }
            const args = JSON.parse(argsStr)
            // Assumes this.func expects a single argument object
            const result = await this.func.call(this.thisArg, args)
            console.debug(
                `Successfully executed ${this.name}(${argsStr}) => ${typeof result}\n${JSON.stringify(
                    result,
                    null,
                    2,
                )}`,
            )
            return JSON.stringify(result)
        } catch (error) {
            return `Error executing ${this.name}(${argsStr}): ${error}`
        }
    }

    /**
     * Reusable builder step to define a tool argument/parameter via the shorthand format.
     *
     * @param {string} paramShorthand Shorthand describing the param formatting (e.g., "id: string*").
     * @param {string} description An explanation of the parameter's intent.
     * @returns {this} The tool instance for chaining.
     */
    prm(paramShorthand, description) {
        const parsedParam = parseParamShorthand(paramShorthand)
        this.properties.push({ ...parsedParam, description })
        return this
    }

    /**
     * Gets the tool's description in a format suitable for LLM function calling.
     * @returns {ToolDescriptor} The structured description of the tool.
     */
    get descriptor() {
        /** @type {ToolProperties} */
        const properties = {}
        for (const p of this.properties) {
            properties[p.name] = {
                type: p.type,
                description: p.description,
            }

            if (properties[p.name].type === 'array') {
                properties[p.name].items = {
                    type: properties[p.name].itemsType,
                }
            }
        }

        /** @type {ToolParameters} */
        const parameters = {
            type: 'object',
            properties,
            required: this.properties.filter((p) => p.required).map((p) => p.name),
            additionalProperties: this.additionalProperties,
        }

        return {
            type: 'function',
            function: {
                name: this.name,
                description: this.description,
                parameters,
                strict: this.strict,
            },
        }
    }
}
