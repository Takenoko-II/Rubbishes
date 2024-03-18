import { ItemStack } from "@minecraft/server";

import { Numeric } from "./Numeric";
import { utils } from "./Utilities";

export class Entry {
    constructor(value = new ItemStack("minecraft:air"), weight) {
        if (value instanceof ItemStack || value instanceof LootTable) {
            this.#internal.value = value;
        }
        else throw TypeError();

        if (!Numeric.isNumeric(weight)) throw TypeError();
        
        this.#internal.weight = weight;
    }

    #internal = {
        value: new ItemStack("minecraft:air"),
        weight: NaN
    };

    get weight() {
        return this.#internal.weight;
    }

    set weight(value) {
        if (!Numeric.isNumeric(value)) throw TypeError();

        this.#internal.weight = value;
    }

    get type() {
        if (this.#internal.value instanceof LootTable) {
            return "loot_table";
        }
        else if (this.#internal.value instanceof ItemStack) {
            if (this.#internal.value.type.id === "") return "empty";
            else return "item";
        }
    }

    set type(_) {
        throw Error();
    }

    get() {
        if (this.#internal.value instanceof LootTable) {
            return this.#internal.value.roll();
        }
        else if (this.#internal.value instanceof ItemStack) {
            return [this.#internal.value];
        }
        else throw Error();
    }
}

export class Pool {
    constructor(rolls) {
        if (!Numeric.isNumeric(rolls)) throw TypeError();
        
        this.#internal.rolls = rolls;
    }

    #internal = {
        rolls: NaN,
        entries: []
    };

    get rolls() {
        return this.#internal.rolls;
    }

    set rolls(value) {
        if (!Numeric.isNumeric(value)) throw TypeError();

        this.#internal.rolls = value;
    }

    get entries() {
        const that = this;

        return {
            add(entry) {
                if (!(entry instanceof Entry)) throw TypeError();

                that.#internal.entries.push(entry);
            },
            set(entries) {
                if (!Array.isArray(entries)) throw TypeError();
                if (entries.some(_ => !(_ instanceof Entry))) throw TypeError();

                that.#internal.entries = entries;
            },
            get() {
                return [...that.#internal.entries];
            }
        };
    }

    set entries(_) {
        throw Error();
    }
}

export class LootTable {
    constructor(id) {
        if (typeof id !== "string") throw TypeError();

        this.#internal.id = id;
    }

    #internal = {
        id: "",
        pools: []
    };

    get id() {
        return this.#internal.id;
    }

    set id(_) {
        throw Error();
    }

    get pools() {
        const that = this;

        return {
            add(pool) {
                if (!(pool instanceof Pool)) throw TypeError();

                that.#internal.pools.push(pool);
            },
            set(pools) {
                if (!Array.isArray(pools)) throw TypeError();
                if (pools.some(_ => !(_ instanceof Pool))) throw TypeError();

                that.#internal.pools = pools;
            }
        };
    }

    set pools(_) {
        throw Error();
    }

    roll() {
        const items = [];

        for (const pool of this.#internal.pools) {
            for (let i = 0; i < pool.rolls; i++) {
                const list = [];

                for (const [index, entry] of pool.entries.get().entries()) {
                    list.push(...[...Array(entry.weight)].fill(index));
                }

                const index = Math.floor(Math.random() * list.length);
                const item = pool.entries.get()[list[index]].get();
                items.push(...item);
            }
        }

        return items;
    }
}
