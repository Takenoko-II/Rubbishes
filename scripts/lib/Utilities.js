import { Numeric } from "./Numeric.js";

export class Utilities {
    stringify(data, getPrototype = false, space = 4) {
        if (!Numeric.isNumeric(space)) {
            throw new TypeError();
        }
        else if (typeof getPrototype !== "boolean") {
            throw new TypeError();
        }

        return (function _(object, indentationCount) {
            switch (typeof object) {
                case "string": return "§r§6\"" + object + "§r§6\"§f";
                case "number": return "§r§a" + String(object) + "§r§f";
                case "boolean":
                case "undefined": return "§r§9" + String(object) + "§r§f";
                case "function": {
                    const code = String(object);
    
                    if (code.startsWith("class")) {
                        return "§r§9class §a" + object.name + "§r§f {§9...§f}";
                    }
                    else if (code.startsWith("async")) {
                        return "§r§9async function §e" + object.name + "§r§f() {§q...§f}";
                    }
                    else if (code.startsWith("function") && [Object, String, Number, Boolean, Array].includes(object)) {    
                        return "§r§9function §a" + object.name + "§r§f() {§q...§f}";
                    }
                    else return "§r§9function §e" + object.name + "§r§f() {§q...§f}";
                }
                case "symbol": return "§r§uSymbol(" + (object.description === undefined ? "" : "§r§6\"" + object.description + "§r§6\"") + "§u)§r§f";
                case "object": {
                    if (object === null) return "§r§9null§r§f";
                    if (object instanceof Error) {
                        let errorMessage = (object.message === "") ? "" : "§6\"" + object.message + "§r§6\"";
                        return "§r§a" + object.name + "§r(" + errorMessage + "§r)";
                    }
    
                    let indentation = "";
        
                    for (let i = 0; i < indentationCount; i++) {
                        indentation += " ".repeat(space);
                    }
        
                    let result = "§r§f" + ((Array.isArray(object)) ? "[" : "{");

                    let keyCount = 0;
                    const keys = [];

                    if (getPrototype === true) {
                        for (const _ in object) {
                            keyCount++;
                            keys.push(_);
                        }
                    }
                    else {
                        for (const _ of Object.keys(object)) {
                            keyCount++;
                            keys.push(_);
                        }
                    }

                    let i = 0;
                    for (const key of keys) {
                        i++;

                        const value = object[key];

                        result += "\n" + indentation;

                        if (Array.isArray(object)) {
                            result +=  _(value, indentationCount + 1);
                        }
                        else if (typeof value === "function") {
                            if (value.name.startsWith("class") || [Object, String, Number, Boolean, Array].includes(value)) {
                                result += "§a" + key + "§r§f {§9...§f}";
                            }
                            else if (value.name.startsWith("async")) {
                                result += "§9async §e" + key + "§r§f() {§q...§f}";
                            }
                            else result += "§e" + key + "§r§f() {§q...§f}";
                        }
                        else {
                            let isReadonly = false;

                            try {
                                const previous = object[key];
                                object[key] = 0;
                                object[key] = previous;
                            }
                            catch (e) {
                                if (e instanceof TypeError && e.message === `'${key}' is read-only`) {
                                    isReadonly = true;
                                }
                            }

                            result += "§" + (isReadonly ? "9" : "b") + key + "§f: " + _(value, indentationCount + 1);
                        }

                        if (i < keyCount) result += ",";
                    }

                    if (keyCount > 0) result += "\n" + indentation.slice(space);

                    return result += Array.isArray(object) ? "]" : "}";
                }
                default:
                    throw new TypeError("この型の値は文字列化できません");
            }
        })(data, 1);
    }

    shallowCopy(object) {
        if (typeof object !== "object" || object === null) return object;
        else if (Array.isArray(object)) return [...object];
        else return Object.assign({}, object);
    }
    
    deepCopy(object) {
        if (typeof object !== "object" || object === null) return object;
        else {
            const result = Array.isArray(object) ? [] : {};

            for (const [key, value] of Object.entries(object)) {
                result[key] = this.deepCopy(value);
            }

            return result;
        }
    }

    split(text, separator, options = {}) {
        if (typeof text !== "string") {
            throw new TypeError();
        }
        else if (typeof options !== "object" || options === null || Array.isArray(options)) {
            throw new TypeError();
        }
        else if (options.deleteQuote !== undefined && typeof options.deleteQuote !== "boolean") {
            throw new TypeError();
        }

        if (options.deleteQuote === undefined) {
            options.deleteQuote = true;
        }

        const quoteRegExp = /("(.*?)(?<!\\)")|('(.*?)(?<!\\)')|(`(.*?)(?<!\\)`)/g;
        const id = "≵";
        let matching = text.match(quoteRegExp);
    
        const result = text
            .replace(quoteRegExp, id)
            .replace(/\\(?=")/g, "")
            .split(separator)
            .map(char => {
                while (char.includes(id) && matching !== null) {
                    if (options.deleteQuote === true) {
                        char = char.replace(id, matching[0].slice(1, -1).replace(/\\"/g, "\""));
                    }
                    else {
                        char = char.replace(id, matching[0].replace(/\\"/g, "\""));
                    }
                    matching.shift();
                }
                return char;
            });
        
        return result;
    }
    
    out(...values) {
        if (values.length === 0) {
            console.warn("out");
            return;
        }

        const list = [];
    
        for (const value of values) {
            list.push(this.stringify(value));
        }

        console.warn(...list);
    }

    here() {
        const { stack } = new Error();
        return stack.replace(/\s+at here \(.+Utilities\.js:\d+\)\s+at /g, "").replace(/\n/g, "");
    }

    deepFreeze(object) {
        if (typeof object !== "object" || object === null) return object;
        else {
            const result = Array.isArray(object) ? [] : {};

            for (const [key, value] of Object.entries(object)) {
                result[key] = Object.freeze(this.deepFreeze(value));
            }

            return Object.freeze(result);
        }
    }

    stringifyWithoutColor(data, getPrototype = false, space = 4) {
        if (!Numeric.isNumeric(space)) {
            throw new TypeError();
        }
        else if (typeof getPrototype !== "boolean") {
            throw new TypeError();
        }

        return (function _(object, indentationCount) {
            switch (typeof object) {
                case "string": return "\"" + object + "\"";
                case "function": {
                    const code = String(object);

                    if (code.startsWith("class")) {
                        return "class " + object.name + " {...}";
                    }
                    else if (code.startsWith("async")) {
                        return "async function " + object.name + "() {...}";
                    }
                    else return "function " + object.name + "() {...}";
                }
                case "symbol": return "Symbol(" + (object.description === undefined ? "" : "\"" + object.description + "\"") + ")";
                case "object": {
                    if (object === null) return "null";
                    if (object instanceof Error) {
                        let errorMessage = (object.message === "") ? "" : "\"" + object.message + "\"";
                        return object.name + "(" + errorMessage + ")";
                    }
    
                    let indentation = "";
        
                    for (let i = 0; i < indentationCount; i++) {
                        indentation += " ".repeat(space);
                    }
        
                    let result = (Array.isArray(object)) ? "[" : "{";

                    let keyCount = 0;
                    const keys = [];

                    if (getPrototype === true) {
                        for (const _ in object) {
                            keyCount++;
                            keys.push(_);
                        }
                    }
                    else {
                        for (const _ of Object.keys(object)) {
                            keyCount++;
                            keys.push(_);
                        }
                    }

                    let i = 0;
                    for (const key of keys) {
                        i++;

                        const value = object[key];

                        result += "\n" + indentation;

                        if (Array.isArray(object)) {
                            result +=  _(value, indentationCount + 1);
                        }
                        else if (typeof value === "function") {
                            if (value.name.startsWith("async")) {
                                result += "async " + key + "() {...}";
                            }
                            else result += key + "() {...}";
                        }
                        else result += key + ": " + _(value, indentationCount + 1);

                        if (i < keyCount) result += ",";
                    }

                    if (keyCount > 0) result += "\n" + indentation.slice(space);

                    return result += Array.isArray(object) ? "]" : "}";
                }
                default:
                    return String(object);
            }
        })(data, 1);
    }
}

export const utils = new Utilities();
