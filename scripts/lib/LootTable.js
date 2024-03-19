import { Block, Container, Dimension, ItemStack, Player } from "@minecraft/server";

import { Numeric } from "./Numeric";

import { Random } from "./Random";

import { MultiDimensionalVector } from "./MultiDimensionalVector";

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
        id: "",
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

    getItemStacks() {
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
            },
            delete(entry) {
                if (!(entry instanceof Entry)) throw TypeError();

                that.#internal.entries = that.#internal.entries.filter(_ => _ !== entry);
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
            },
            delete(pool) {
                if (!(pool instanceof Pool)) throw TypeError();

                that.#internal.pools = that.#internal.pools.filter(_ => _ !== pool);
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
                items.push(...entries[index].getItemStacks().map(_ => _.clone()));
            }
        }

        return items;
    }

    /**
     * @param {Container} container
     */
    fill(container) {
        if (!(container instanceof Container)) {
            throw TypeError();
        }

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
                    item.amount = subtractAmount;
                    if (container.getSlot(slot).hasItem() && !container.getItem(slot).isStackableWith(item)) continue;
                    container.setItem(slot, item);
                    item.amount = newAmount;
                }

                items = Random.shuffle(items);
            }

            if (container.emptySlotsCount === 0) break;
        }

        return container;
    }

    /**
     * @param {Dimension} dimension 
     * @param {import("@minecraft/server").Vector3} location 
     */
    spawn(dimension, location) {
        if (!(dimension instanceof Dimension && MultiDimensionalVector.isVector3(location))) {
            throw TypeError();
        }

        for (const item of this.roll()) {
            const entity = dimension.spawnItem(item, location);

            const x = new Random(-180, 179).generate();
            const y = new Random(-90, -30).generate();
            const vec = MultiDimensionalVector.getDirectionFromRotation({ x, y });

            entity.applyImpulse(vec.multiply(0.05));
        }
    }

    /**
     * @param {string} id
     * @param {{ pools: { rolls: number; entries: { weight: number; value: ItemStack | LootTable }[]; }[]; }} json 
     */
    static create(id, json) {
        if (typeof id !== "string") {
            throw TypeError();
        }
        else if (typeof json !== "object" || json === null || Array.isArray(json)) {
            throw TypeError();
        }
        
        const keys = Object.keys(json);

        if (!(keys.length === 1 && keys[0] === "pools" && Array.isArray(json.pools))) {
            throw TypeError();
        }
        else if (json.pools.some(({ rolls, entries }) => !Numeric.isNumeric(rolls) || !Array.isArray(entries))) {
            throw TypeError();
        }
        else if (json.pools.some(({ entries }) => entries.some(({ weight, value }) => !Numeric.isNumeric(weight) || !(value instanceof this || value instanceof ItemStack)))) {
            throw TypeError();
        }

        const lootTable = new this(id);
        const pools = json.pools.map(_ => {
            const pool = new Pool(_.rolls);

            const entries = _.entries.map(({ value, weight }) => new Entry(value, weight));

            pool.entries.set(entries);

            return pool;
        });

        lootTable.pools.set(pools);

        return lootTable;
    }
}
