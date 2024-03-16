import { Numeric } from "./Numeric.js";

export class Utilities {
    stringify(data, prototype = false, space = 4) {
        if (!Numeric.isNumeric(space)) {
            throw new TypeError();
        }
        else if (typeof prototype !== "boolean") {
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

                    if (prototype === true) {
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

                        if (typeof value === "object") {
                            if (Array.isArray(object)) result += "\n" + indentation + _(value, indentationCount + 1);
                            else result += "\n" + indentation + "§b" + key + "§b: " + _(value, indentationCount + 1);
                        }
                        else {
                            if (Array.isArray(object)) result += "\n" + indentation + _(value);
                            else result += "\n" + indentation + "§b" + key + "§b: " + _(value);
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

    split(text, separator) {
        if (typeof text !== "string") {
            throw new TypeError();
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
                    char = char.replace(id, matching[0].slice(1, -1).replace(/\\"/g, "\""));
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
}

export const utils = new Utilities();
