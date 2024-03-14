import { Numeric } from "./Numeric";

export class Tuple extends Array {
    constructor(...args) {
        if (Numeric.isNumeric(args[0]) && args.length === 1) {
            super(args[0]);
        }
        else if (args.length === 0) {
            super();
        }
        else {
            super(...args);
        }

        return Object.freeze(this);
    }

    static isTuple(arg) {
        return arg instanceof this;
    }

    static from(arrayLike, mapfn, thisArg) {
        if (typeof arrayLike?.[Symbol.iterator] !== "function") {
            throw new TypeError();
        }

        if (typeof mapfn === "function") {
            return new this(...[...arrayLike].map(mapfn, thisArg));
        }
        else if (mapfn === undefined) {
            return new this(...arrayLike);
        }
        else throw new TypeError();
    }
}
