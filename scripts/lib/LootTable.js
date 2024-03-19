import { Block, Container, ItemStack } from "@minecraft/server";

import { Numeric } from "./Numeric";

import { Random } from "./Random";
import { utils } from "./Utilities";

export class Entry {
    constructor(value = new ItemStack("minecraft:air"), weight = 1) {
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
    constructor(rolls = 1) {
        if (!Numeric.isNumeric(rolls)) throw TypeError();
        
        this.#internal.rolls = rolls;
    }

    #internal = {
        /**
         * @type {number}
         */
        rolls: NaN,
        /**
         * @type {Entry[]}
         */
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
                return Object.freeze([...that.#internal.entries]);
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
        /**
         * @type {string}
         */
        id: "",
        /**
         * @type {Pool[]}
         */
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
            },
            get() {
                return Object.freeze([...that.#internal.pools]);
            }
        };
    }

    set pools(_) {
        throw Error();
    }

    roll() {
        /** @type {ItemStack[]} */
        const items = [];

        for (const pool of this.#internal.pools) {
            for (let i = 0; i < pool.rolls; i++) {
                /** @type {Entry[]} */
                const entries = [];

                for (const entry of pool.entries.get()) {
                    entries.push(...Array(entry.weight).fill(entry));
                }

                const index = Math.floor(Math.random() * entries.length);
                items.push(...entries[index].get().map(_ => _.clone()));
            }
        }

        return items;
    }

    /**
     * @param {Container} container
     */
    fill(container) {
        let items = Random.shuffle(this.roll());

        container.clearAll();

        const slots = Random.shuffle([...Array(container.size).keys()]);

        while (items.length > 0) {
            for (const slot of slots) {
                if (Random.chance(0.75) || items.length <= 0) continue;
                const item = items[0];
                const subtractAmount = new Random(1, item.amount).generate();
                const newAmount = item.amount - subtractAmount;
                if (newAmount <= 0) {
                    if (container.getSlot(slot).hasItem() && !container.getItem(slot).isStackableWith(item)) continue;
                    container.setItem(slot, item);
                    items.splice(items.indexOf(item), 1);
                }
                else {
                    item.amount = newAmount;
                    if (container.getSlot(slot).hasItem() && !container.getItem(slot).isStackableWith(item)) continue;
                    container.setItem(slot, item);
                }

                items = Random.shuffle(items);
            }

            if (container.emptySlotsCount === 0) break;
        }

        return container;
    }
}
