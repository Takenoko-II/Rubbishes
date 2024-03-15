import { Numeric } from "./Numeric";

import { Tuple } from "./Tuple";

export const NumberList = {
    isInvalid(list) {
        if (!Array.isArray(list)) return true;
        if (list.some(element => typeof element !== "number" || Number.isNaN(element))) return true;
        return false;
    },
    average(list) {
        if (this.isInvalid(list)) throw new TypeError("引数は数値の配列のみ許可されています");
        return list.reduce((a, b) => a + b) / list.length;
    },
    median(list) {
        if (this.isInvalid(list)) throw new TypeError("引数は数値の配列のみ許可されています");
        const half = Math.floor(list.length / 2);
        const sorted = list.sort((a, b) => a - b);
        if (list.length % 2 === 0) return (sorted[half] + sorted[half - 1]) / 2;
        else return sorted[half];
    },
    mode(list) {
        if (!Array.isArray(list)) throw new TypeError("引数は配列のみ許可されています");
        const foundCounter = [...new Set(list)].map(value => ({ count: 0, value }));
        for (const element of list) {
            const index = foundCounter.findIndex(_ => _.value === element);
            foundCounter[index].count++;
        }
        const max = this.max(foundCounter.map(_ => _.count));
        return foundCounter.filter(_ => _.count === max).map(_ => _.value);
    },
    min(list) {
        if (this.isInvalid(list)) throw new TypeError("引数は数値の配列のみ許可されています");
        return list.reduce((a, b) => Math.min(a, b));
    },
    max(list) {
        if (this.isInvalid(list)) throw new TypeError("引数は数値の配列のみ許可されています");
        return list.reduce((a, b) => Math.max(a, b));
    },
    create(length = 0, modifier = i => i) {
        if (!(Numeric.isNumeric(length) && typeof modifier === "function")) {
            throw new TypeError();
        }

        return new Tuple(...[...Array(length)].map((_, index) => {
            const value = modifier(index);

            if (Numeric.isNumeric(value)) {
                return value;
            }
            else throw new TypeError();
        }));
    }
}
