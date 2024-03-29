import { Container, Dimension, EnchantmentTypes, ItemStack } from "@minecraft/server";

import { EnchantmentTypeIdentifierList } from "../enum/EnchantmentTypeIdentifierList";

import { utils, NumberRange, MultiDimensionalVector, Random, Numeric } from "./index";

export class Entry {
    constructor(value = new ItemStack("minecraft:air"), weight = 1) {
        if (value instanceof ItemStack || value instanceof LootTable) {
            this.#internal.value = value;
        }
        else if (value === "empty") {
            this.#internal.value = new ItemStack("air");
        }
        else if (typeof value === "string") {
            this.#internal.value = new ItemStack(value);
        }
        else throw TypeError();

        if (!Numeric.isNumeric(weight)) throw TypeError();

        this.#internal.weight = weight;
    }

    /**
     * @type {{ value: ItemStack | LootTable; weight: number; functions: ((clone: ItemStack) => void)[] }}
     */
    #internal = {
        value: new ItemStack("minecraft:air"),
        weight: NaN,
        functions: []
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
            if (this.#internal.value.type.id === "minecraft:air") return "empty";
            else return "item";
        }
    }

    set type(_) {
        throw TypeError("'type' is read-only");
    }

    get functions() {
        const that = this;

        if (this.type !== "item") throw Error();

        /**
         * @param {unknown} value 
         * @param {(itemStack: ItemStack) => { min: number; max: number; }} strict
         * @returns {Random}
         */
        function common(value, strict) {
            let range;

            if (NumberRange.isNumberRange(value)) {
                range = value;
            }
            else if (Numeric.isNumeric(value)) {
                range = { min: value, max: value }
            }
            else throw TypeError();

            range.min = Math.max(range.min, strict(that.#internal.value).min);
            range.max = Math.min(range.max, strict(that.#internal.value).max);

            return new Random(range.min, range.max);
        }

        return {
            count(value) {
                const random = common(value, itemStack => ({
                    min: 1,
                    max: itemStack.maxAmount
                }));

                that.#internal.functions.push((clone) => {
                    clone.amount = random.generate();
                });

                return that;
            },
            damage(value) {
                const random = common(value, itemStack => ({
                    min: 0,
                    max: itemStack.getComponent("durability").maxDurability
                }));

                that.#internal.functions.push((clone) => {
                    clone.getComponent("durability").damage = random.generate();
                });

                return that;
            },
            get enchantments() {
                function isEnchantmentEntry(_) {
                    if (typeof _ !== "object" || Array.isArray(_) || _ === null) {
                        return false;
                    }
                    else if (!(typeof _.id === "string" && (NumberRange.isNumberRange(_.level) || Numeric.isNumeric(_.level)))) {
                        return false;
                    }
                    else return true;
                }
        
                function isArrayOfEnchantmentEntry(_) {
                    if (!Array.isArray(_)) return false;
                    else if (_.some(_ => !isEnchantmentEntry(_))) return false;
                    else return true;
                }

                return {
                    add(value) {        
                        if (!isEnchantmentEntry(value) && !isArrayOfEnchantmentEntry(value)) {
                            throw TypeError();
                        }
        
                        that.#internal.functions.push((clone) => {
                            /**
                             * @type {{ id: string; level: number | { min: number; max: number; } }}
                             */
                            const enchantment = isArrayOfEnchantmentEntry(value) ? Random.choice(value) : value;

                            const enchantmentType = EnchantmentTypes.get(enchantment.id);
        
                            if (!enchantmentType) throw TypeError();
        
                            const random = common(enchantment.level, () => ({
                                min: 1,
                                max: enchantmentType.maxLevel
                            }));
        
                            clone.getComponent("enchantable").addEnchantment({
                                type: enchantmentType,
                                level: random.generate()
                            });
                        });
        
                        return that;
                    },
                    set(value) {
                        if (!isEnchantmentEntry(value) && !isArrayOfEnchantmentEntry(value)) {
                            throw TypeError();
                        }

                        if (isEnchantmentEntry(value)) value = [value];

                        that.#internal.functions.push((clone) => {
                            clone.getComponent("enchantable").removeAllEnchantments();

                            for (const enchantment of value) {        
                                const enchantmentType = EnchantmentTypes.get(enchantment.id);
        
                                if (!enchantmentType) throw TypeError();
        
                                const random = common(enchantment.level, () => ({
                                    min: 1,
                                    max: enchantmentType.maxLevel
                                }));
        
                                clone.getComponent("enchantable").addEnchantment({
                                    type: enchantmentType,
                                    level: random.generate()
                                });
                            }
                        });
        
                        return that;
                    },
                    random() {
                        that.#internal.functions.push(clone => {
                            const identifiers = EnchantmentTypeIdentifierList.slice(0).filter(id => {
                                try {
                                    return clone.getComponent("enchantable").canAddEnchantment({
                                        type: EnchantmentTypes.get(id),
                                        level: 1
                                    });
                                }
                                catch {
                                    return false;
                                }
                            });

                            const enchantmentIds = Random.shuffle(identifiers).slice(0, new Random(1, identifiers.length - 1).generate());

                            for (const enchantmentId of enchantmentIds) {
                                const type = EnchantmentTypes.get(enchantmentId);
                                const level = new Random(1, type.maxLevel).generate();

                                clone.getComponent("enchantable").removeEnchantment(type);
                                try {
                                    clone.getComponent("enchantable").addEnchantment({ type, level });
                                }
                                catch {}
                            }
                        });

                        return that;
                    }
                };
            },
            set enchantments(_) {
                throw TypeError();
            },
            name(value) {
                if (typeof value !== "string") {
                    throw TypeError();
                }

                that.#internal.functions.push(clone => {
                    clone.nameTag = value;
                });

                return that;
            },
            lore(value) {
                if (!Array.isArray(value)) {
                    throw TypeError();
                }
                else if (value.some(_ => typeof _ !== "string")) {
                    throw TypeError();
                }

                that.#internal.functions.push(clone => {
                    clone.setLore(value);
                });

                return that;
            },
            script(value) {
                if (typeof value !== "function") {
                    throw TypeError();
                }

                that.#internal.functions.push(value);

                return that;
            }
        };
    }

    set functions(_) {
        throw TypeError("'functions' is read-only");
    }

    getItemStacks() {
        if (this.#internal.value instanceof LootTable) {
            return this.#internal.value.roll();
        }
        else if (this.#internal.value instanceof ItemStack) {
            const itemStack = this.#internal.value.clone();

            this.#internal.functions.forEach(f => f(itemStack));

            return [itemStack];
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
        throw TypeError("'entries' is read-only");
    }
}

export class LootTable {
    constructor(id) {
        if (typeof id !== "string") throw TypeError();

        if ([...LootTable.#tables].some(_ => _.id === id)) {
            throw Error("同じIDのルートテーブルを作成することはできません");
        }

        this.#internal.id = id;

        LootTable.#tables.add(this);
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
        throw TypeError("'id' is read-only");
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
        throw TypeError("'pools' is read-only");
    }

    roll() {
        /** @type {ItemStack[]} */
        const items = [];

        for (const pool of this.#internal.pools) {
            for (let i = 0; i < pool.rolls; i++) {
                const entries = pool.entries.get();

                const index = Random.choiceByWeight(entries.map(({ weight }) => weight));

                items.push(...entries[index].getItemStacks());
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

        const slotNumbers = Random.shuffle([...Array(container.size).keys()]);

        let i = 0;
        a: while (items.length > 0) {
            for (const slotNumber of slotNumbers) {
                if (Random.chance(0.75) || items.length <= 0) continue;

                const slot = container.getSlot(slotNumber);
                const item = items[0];

                const randomAmount = new Random(1, item.amount).generate();

                if (slot.hasItem()) {
                    if (slot.isStackableWith(item)) {
                        const addableAmount = slot.maxAmount - slot.amount;
                        const addend = Math.min(randomAmount, addableAmount);

                        slot.amount += addend;
                        if ((item.amount - addend) <= 0) {
                            items.shift();
                        }
                        else {
                            item.amount -= addend;
                        }
                    }

                    continue;
                }

                const newAmount = item.amount - randomAmount;

                if (newAmount <= 0) {
                    slot.setItem(item);
                    items.shift();
                }
                else {
                    item.amount = randomAmount;
                    slot.setItem(item);
                    item.amount = newAmount;
                }

                items = Random.shuffle(items);
            }
            i++;
            if (i > 1000) throw new Error("overflow!?!?!?!?")

            if (container.emptySlotsCount > 0) continue a;

            for (let i = 0; i < container.size; i++) {
                const slot = container.getSlot(i);
                for (const item of items) {
                    if (slot.isStackableWith(item)) continue a;
                }
            }

            break a;
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

    /**
     * @type {Set<LootTable>}
     */
    static #tables = new Set();

    static get(id) {
        if (typeof id !== "string") {
            throw TypeError();
        }

        return [...this.#tables].find(_ => _.id === id);
    }
}
