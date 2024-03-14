import { Player, system, world } from "@minecraft/server";

import { Numeric, Random, utils } from "../lib/index";

const PRIVATE_CONSTRUCTOR_SYMBOL = Symbol();
const TYPEERROR_SYMBOL = Symbol("Unexpected type parameter");
const MISSINGPARAMETER_SYMBOL = Symbol("Missing parameter");

function parseObject(object) {
    if (typeof object !== "string") {
        return undefined;
    }

    if ((object.startsWith("{") && object.endsWith("}")) || (object.startsWith("[") && object.endsWith("]"))) {
        const code = `return ${object};`
            .replace(/import\([^\)]*\)/g, "")
            .replace(/console|eval\([^\)]*\)|Function\([^\)]*\)/g, "");

        try {
            return Function(code)();
        }
        catch {
            return undefined;
        }
    }
    else return undefined;
}

function parse(value, type, strict = false) {
    switch (type) {
        case "string": return String(value);
        case "number": {
            switch (value) {
                case "true": return (strict === true) ? TYPEERROR_SYMBOL : 1;
                case "false": return (strict === true) ? TYPEERROR_SYMBOL : 0;
                case "null": return (strict === true) ? TYPEERROR_SYMBOL : 0;
                case "undefined": return (strict === true) ? TYPEERROR_SYMBOL : 0;
                default: return Numeric.from(value) ?? TYPEERROR_SYMBOL;
            }
        }
        case "boolean": {
            switch (value) {
                case "true": return true;
                case "false": return false;
                case "null": return (strict === true) ? TYPEERROR_SYMBOL : false;
                case "undefined": return (strict === true) ? TYPEERROR_SYMBOL : false;
                case "0": return (strict === true) ? TYPEERROR_SYMBOL : false;
                case "1": return (strict === true) ? TYPEERROR_SYMBOL : true;
                default: return TYPEERROR_SYMBOL;
            }
        }
        case "object": {
            switch (value) {
                case "null": return (strict === true) ? TYPEERROR_SYMBOL : null;
                default: return parseObject(value) ?? TYPEERROR_SYMBOL;
            }
        }
        case "symbol": {
            switch (value) {
                case "Symbol()": return Symbol();
                default: return TYPEERROR_SYMBOL;
            }
        }
        case "undefined": {
            switch (value) {
                case "undefined": return (strict === true) ? TYPEERROR_SYMBOL : undefined;
                case "0": return (strict === true) ? TYPEERROR_SYMBOL : undefined;
                case "false": return (strict === true) ? TYPEERROR_SYMBOL : undefined;
                case "null": return (strict === true) ? TYPEERROR_SYMBOL : undefined;
                default: return TYPEERROR_SYMBOL;
            }
        }
        case "any": {
            if (value === "true") return true;
            else if (value === "false") return false;
            else if (value === "null") return null;
            else if (value === "undefined") return undefined;
            else if (Numeric.isNumeric(Numeric.from(value))) return Numeric.from(value);
            else if (typeof parseObject(value) === "object") return parseObject(value);
            else return String(value);
        }
        default: return parse(value, "any", strict);
    }
}

export class ChatCommandBuilder {
    constructor(symbol) {
        if (symbol !== PRIVATE_CONSTRUCTOR_SYMBOL) {
            throw new Error("クラス外からのconstructorの呼び出しは禁止されています");
        }
    }

    #internal = {
        name: undefined,
        parameters: [],
        permission: 0,
        isStrict: false,
        execute: () => undefined
    };

    setPermissionLevel(value) {
        if (!Numeric.isNumeric(value)) {
            throw new TypeError();
        }
        else if (!Number.isInteger(value)) {
            throw new Error();
        }
        else if (value < 0 || value > 4) {
            throw new RangeError();
        }

        this.#internal.permission = value;

        return this;
    }

    setStrictMode() {
        this.#internal.isStrict = true;

        return this;
    }

    get parameters() {
        const that = this;

        return {
            define(id, options = {}) {
                if (typeof id !== "string") {
                    throw new TypeError();
                }
                else if (typeof options !== "object" || options === null) {
                    throw new TypeError();
                }
                else if (options.type !== undefined && typeof options.type !== "string") {
                    throw new TypeError();
                }
                else if (options.isOptional !== undefined && typeof options.isOptional !== "boolean") {
                    throw new TypeError();
                }

                if (that.#internal.parameters.some(_ => _.id === id)) {
                    throw new Error();
                }

                const type = options.type ?? "any";
                const isOptional = options.isOptional ?? false;
                const defaultValue = options.defaultValue;

                that.#internal.parameters.push({ id, type, isOptional, defaultValue });

                return that;
            }
        };
    }

    set parameters(_) {
        throw new Error();
    }

    onExecute(callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError();
        }

        this.#internal.execute = callbackFn;

        return this;
    }

    static register(name) {
        if (typeof name !== "string") {
            throw new TypeError();
        }

        if (this.#registeredCommands.some(_ => _.name === name)) {
            throw new Error();
        }

        const builder = new this(PRIVATE_CONSTRUCTOR_SYMBOL);
        builder.#internal.name = name;

        this.#registeredCommands.push(builder.#internal);

        return builder;
    }

    static execute(executor, commandString) {
        if (!(executor instanceof Player)) {
            throw new TypeError();
        }
        else if (typeof commandString !== "string") {
            throw new TypeError();
        }

        const [commandName, ...parameterStringList] = utils.split(commandString, /\s+/g).filter(_ => _ !== "");

        const command = this.#registeredCommands.find(({ name }) => name === commandName);

        if (!command) {
            return false;
        }

        const playerPermissionLevel = executor.isOp() ? 1 : 0;

        if (command.permission > playerPermissionLevel) {
            send(new Error("insufficient permission level"));
        }

        const registeredParameterList = command.parameters;

        const parameters = parameterStringList.map((parameterString, index) => {
            if (!registeredParameterList[index]) {
                return { id: Random.uuid(), value: parse(parameterString, "any", command.isStrict) };
            }

            const { id, type } = registeredParameterList[index];
            return { id, value: parse(parameterString, type, command.isStrict) };
        });

        const flags = {
            sendOutput: true,
            fail: false,
            cancel: false,
            showPrototype: false
        };

        function send(value) {
            if (flags.sendOutput === false) {
                return;
            }

            const uuid = Random.uuid();
            const message = `@${executor.name} ran §a${commandName}§r; §e>>>§r ${uuid}§r: ${utils.stringify(value, flags.showPrototype)}`;

            if (value instanceof Error || flags.fail === true) {
                world.sendMessage(message.replace(uuid, "§cfailed"));
            }
            else world.sendMessage(message.replace(uuid, "§asuccess"));
        }

        for (const { id, isOptional, defaultValue } of registeredParameterList) {
            if (parameters.some(_ => _.id === id)) {
                if (command.isStrict === true && parameters.find(_ => _.id === id).value === TYPEERROR_SYMBOL) {
                    send(new TypeError("unexpected type parameter: strict-mode"));
                    flags.fail = true;
                    return true;
                }
                continue;
            }

            if (isOptional === false) {
                send(new TypeError("missing parameter: " + id));
                flags.fail = true;
                return true;
            }
            else {
                parameters.push({ id, value: defaultValue ?? MISSINGPARAMETER_SYMBOL });
            }
        }

        const data = {
            get name() {
                return commandName;
            },
            set name(_) {
                throw new Error();
            },
            get sendOutput() {
                return flags.sendOutput;
            },
            set sendOutput(value) {
                if (typeof value !== "boolean") {
                    throw new TypeError();
                }

                flags.sendOutput = value;
            },
            get fail() {
                return flags.fail;
            },
            set fail(value) {
                if (typeof value !== "boolean") {
                    throw new TypeError();
                }

                flags.fail = value;
            },
            get showPrototype() {
                return flags.showPrototype;
            },
            set showPrototype(value) {
                if (typeof value !== "boolean") {
                    throw new TypeError();
                }

                flags.showPrototype = value;
            },
            get parameters() {
                return {
                    get(id) {
                        if (typeof id !== "string") {
                            throw new TypeError();
                        }

                        const parameter = parameters.find(_ => _.id === id);
                        if (!parameter) {
                            throw new ReferenceError("unregistered parameter");
                        }
                        else return parameter.value;
                    },
                    getAll() {
                        return parameters;
                    },
                    isValid(id) {
                        const value = this.get(id);
                        return value !== MISSINGPARAMETER_SYMBOL && value !== TYPEERROR_SYMBOL;
                    }
                };
            },
            set parameters(_) {
                throw new Error();
            },
            get player() {
                return executor;
            },
            set player(_) {
                throw new Error();
            }
        };

        for (const callbackFn of ChatCommandBuilder.#subscribedCallbacks) {
            callbackFn({
                definition: ChatCommandBuilder.commands.get(data.name),
                onExecuteInfo: data,
                get cancel() {
                    return flags.cancel;
                },
                set cancel(value) {
                    if (typeof value !== "boolean") {
                        throw new TypeError();
                    }

                    flags.cancel = value;
                }
            });
        }

        system.runTimeout(() => {
            try {
                if (flags.cancel === false) {
                    const result = command.execute(data);
                    send(result);
                }
                else send(new Error("command execution was canceled"));
            }
            catch (error) {
                send(error);
            }
        });

        return true;
    }

    static #registeredCommands = [];

    static #subscribedCallbacks = [];

    static commands = {
        get: (name) => {
            if (typeof name !== "string") {
                throw new TypeError();
            }

            return new ChatCommandDefinition(this.#registeredCommands.find(_ => _.name === name));
        },
        getAll: () => {
            return this.#registeredCommands.map(_ => new ChatCommandDefinition(_));
        },
        on: (callbackFn) => {
            if (typeof callbackFn !== "function") {
                throw new TypeError();
            }

            this.#subscribedCallbacks.push(callbackFn);

            return callbackFn;
        },
        off: (callbackFn) => {
            if (typeof callbackFn !== "function") {
                throw new TypeError();
            }

            this.#subscribedCallbacks = this.#subscribedCallbacks.filter(_ => _ !== callbackFn);

            return callbackFn;
        }
    };
}

class ChatCommandDefinition {
    constructor(definition) {
        this.#definition = definition;
    }

    #definition;

    get name() {
        return this.#definition.name;
    }

    set name(value) {
        if (typeof value !== "string") {
            throw new TypeError();
        }

        this.#definition.name = value;
    }

    get permission() {
        return this.#definition.permission;
    }

    set permission(value) {
        if (!Numeric.isNumeric(value)) {
            throw new TypeError();
        }
        else if (!Number.isInteger(value)) {
            throw new Error();
        }
        else if (value < 0 || value > 4) {
            throw new RangeError();
        }

        this.#definition.permission = value;
    }

    get parameters() {
        return new ChatCommandParameterDefinitionArray(this.#definition.parameters);
    }

    set parameters(_) {
        throw new Error();
    }

    get isStrict() {
        return this.#definition.isStrict;
    }

    set isStrict(value) {
        if (typeof value !== "boolean") {
            throw new TypeError();
        }
        
        this.#definition.isStrict = value;
    }

    get execute() {
        return this.#definition.execute;
    }

    set execute(value) {
        if (typeof value !== "function") {
            throw new TypeError();
        }

        this.#definition.execute = value;
    }
}

class ChatCommandParameterDefinitionArray extends Array {
    constructor(list) {
        super(...list);
    }

    push(...items) {
        if (items.some(_ => !ChatCommandParameterDefinitionArray.isChatCommandParameterDefinition(_))) {
            throw new TypeError();
        }

        return super.push(...items);
    }

    unshift(...items) {
        if (items.some(_ => !ChatCommandParameterDefinitionArray.isChatCommandParameterDefinition(_))) {
            throw new TypeError();
        }

        return super.unshift(...items);
    }

    splice(start, deleteCount, ...items) {
        if (!Numeric.isNumeric(start)) {
            throw new TypeError();
        }
        else if (deleteCount !== undefined && !Numeric.isNumeric(deleteCount)) {
            throw new TypeError();
        }
        else if (items.some(_ => !ChatCommandParameterDefinitionArray.isChatCommandParameterDefinition(_))) {
            throw new TypeError();
        }

        return super.splice(start, deleteCount, ...items);
    }

    fill(value, start, end) {
        if (!ChatCommandParameterDefinitionArray.isChatCommandParameterDefinition(value)) {
            throw new TypeError();
        }
        else if (start !== undefined && !Numeric.isNumeric(start)) {
            throw new TypeError();
        }
        else if (end !== undefined && !Numeric.isNumeric(end)) {
            throw new TypeError();
        }

        return super.fill(value, start, end);
    }

    static isChatCommandParameterDefinition(value) {
        if (typeof value !== "object") return false;
        else if (value === null) return false;
        else if (typeof value.id !== "string") return false;
        else if (typeof value.type !== "string") return false;
        else if (typeof value.isOptional !== "boolean") return false;
        else return true;
    }
}
