import { NumberRange } from "./NumberRange.js";

import { utils } from "./Utilities.js";

import { Numeric } from "./Numeric.js";

export class Random extends NumberRange {
    constructor(value1 = 0, value2 = 0) {
        super(value1, value2);
            const range = utils.shallowCopy(this);
            this.xorshift = new Xorshift(0);
            this.xorshift.range = range;
    }
    generate() {
        let { min, max } = this;
        let digit = 1;
        let loopCount = 0;
        while (loopCount < 20 && (!Number.isInteger(min) || !Number.isInteger(max))) {
            min *= 10;
            max *= 10;
            digit *= 10;
            loopCount += 1;
        }
        return Math.floor(Math.random() * (max + 1 - min) + min) / digit;
    }
    static shuffle(array) {
        if (!Array.isArray(array)) {
            throw new TypeError("Unexpected type passed to function argument[0].");
        }

        if (array.length === 1) return array;

        const clone = [...array];
        for (let i = clone.length - 1; i >= 0; i--) {
            const current = clone[i];
            const random = Math.floor(Math.random() * (i + 1));

            clone[i] = clone[random];
            clone[random] = current;
        }

        return clone;
    }
    static select(value) {
        if (typeof value !== "object" || value === null) {
            throw TypeError();
        }

        const keys = Object.keys(value);
        const index = new this(0, keys.length - 1).generate();
        const key = keys[index];

        return value[key];
    }
    static chance(chance = 0.5) {
        const number = Math.random() + chance;
        if (number >= 1) return true;
        else return false;
    }
    static sign() {
        if (this.chance()) return 1;
        return -1;
    }
    static uuid() {
        const chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('');
        for (let i = 0; i < chars.length; i++) {
            switch (chars[i]) {
                case 'x':
                    chars[i] = new Random(0, 15).generate().toString(16);
                    break;
                case 'y':
                    chars[i] = new Random(8, 11).generate().toString(16);
                    break;
            }
        }
        return chars.join('');
    }

    static choiceByWeight(list) {
        if (!Array.isArray(list)) {
            throw TypeError();
        }
        else if (list.some(_ => !Numeric.isNumeric(_))) {
            throw TypeError();
        }
    
        const summary = list.reduce((a, b) => a + b);
        const random = Math.floor(Math.random() * summary) + 1;
    
        let totalWeight = 0;
        for (const [index, weight] of list.entries()) {
            totalWeight += weight;
            if (totalWeight >= random) return index;
        }
    }
}

export class Xorshift {
    constructor(seed) {
        this.seed = seed;
    }
    #x = 123456789;
    #y = 362436069;
    #z = 521288629;
    rand(range = undefined) {
        if (range === undefined) range = this.range;
        let t = this.#x ^ (this.#x << 11);
        this.#x = this.#y;
        this.#y = this.#z;
        this.#z = this.seed;
        this.seed = (this.seed ^ (this.seed >>> 19)) ^ (t ^ (t >>> 8));
        if (range !== undefined) {
            let { min, max } = range;
            let digit = 1;
            let loopCount = 0;
            while (loopCount < 20 && (!Number.isInteger(min) || !Number.isInteger(max))) {
                min *= 10;
                max *= 10;
                digit *= 10;
                loopCount += 1;
            }
            return (Math.abs(this.seed) % (max + 1 - min) + min) / digit;
        }
        return this.seed;
    }
    uuid() {
        const chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('');
        for (let i = 0; i < chars.length; i++) {
            switch (chars[i]) {
                case 'x':
                    chars[i] = this.rand(new NumberRange(0, 15)).toString(16);
                    break;
                case 'y':
                    chars[i] = this.rand(new NumberRange(8, 11)).toString(16);
                    break;
            }
        }
        return chars.join('');
    }
    shuffle(array) {
        if (!Array.isArray(array)) {
            throw new TypeError("Unexpected type passed to function argument[0].");
        }

        const clone = utils.shallowCopy(array);
        for (let i = clone.length - 1; i >= 0; i--) {
            const current = clone[i];
            const random = this.rand({ min: 0, max: i });

            clone[i] = clone[random];
            clone[random] = current;
        }

        return clone;
    }
}
