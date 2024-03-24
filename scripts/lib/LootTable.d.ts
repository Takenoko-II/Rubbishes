import { Container, Dimension, ItemStack, Vector3 } from "@minecraft/server";

import { EnchantmentTypeIdentifierList } from "../enum/EnchantmentTypeIdentifierList";

class Entry {
    /**
     * エントリを作成します。
     * @param value 値
     * @param weight 確率
     */
    constructor(value?: string | ItemStack | LootTable, weight?: number);

    /**
     * 確率
     */
    weight: number;

    /**
     * 関数
     */
    readonly functions: EntryModifier;

    /**
     * エントリタイプ
     */
    readonly type: "item" | "empty" | "loot_table";

    /**
     * このエントリが返すアイテムの配列
     */
    getItemStacks(): ItemStack[];

    static readonly prototype;
}

interface NumberRange {
    /**
     * 最小値
     */
    min: number;

    /**
     * 最大値
     */
    max: number;
}

interface EntryModifier {
    /**
     * アイテムの個数を設定します。
     * @param value 個数
     */
    count(value: number): Entry;

    /**
     * アイテムの個数を渡された範囲からランダムに設定します。
     * @param range 個数の範囲
     */
    count(range: NumberRange): Entry;

    /**
     * アイテムの残り耐久値を設定します。
     * @param value 耐久値
     */
    damage(value: number): Entry;

    /**
     * アイテムの残り耐久値を渡された範囲からランダムに設定します。
     * @param range 耐久値の範囲
     */
    damage(range: NumberRange): Entry;

    /**
     * エンチャントの設定
     */
    readonly enchantments: EnchantmentsModifier;

    /**
     * アイテムの名前を設定します。
     * @param text アイテムの名前
     */
    name(text: string): Entry;

    /**
     * アイテムの説明文を設定します。
     * @param list 説明文
     */
    lore(list: string[]): Entry;

    /**
     * このエントリが選ばれるときに実行される関数を設定します。
     * @param callbackFn コールバック関数
     */
    script(callbackFn: (itemStack: ItemStack) => void): Entry;
}

interface EnchantmentsModifier {
    /**
     * アイテムのエンチャントを追加します。
     * @param enchantment エンチャント
     */
    add(enchantment: EnchantmentEntry): Entry;

    /**
     * アイテムのエンチャントを渡されたリストからランダムに選んで追加します。
     * @param enchantments エンチャントのリスト
     */
    add(enchantments: EnchantmentEntry[]): Entry;

    /**
     * アイテムのエンチャントを設定します。
     * @param enchantment エンチャント
     */
    set(enchantment: EnchantmentEntry): Entry;

    /**
     * アイテムのエンチャントを渡されたリストで設定します。
     * @param enchantments エンチャントのリスト
     */
    set(enchantments: EnchantmentEntry[]): Entry;

    /**
     * アイテムのエンチャントを完全にランダムで設定します。
     * @deprecated
     */
    random(): Entry;
}

interface EnchantmentEntry {
    /**
     * エンチャントのID
     */
    id: EnchantmentTypeIdentifierList[number];

    /**
     * エンチャントのレベル
     */
    level: number | NumberRange;
}

class Pool {
    /**
     * プールを作成します。
     * @param rolls 抽選する回数
     */
    constructor(rolls?: number);

    /**
     * 抽選する回数
     */
    rolls: number;

    /**
     * エントリのリスト
     */
    readonly entries: Entries;

    static readonly prototype;
}

interface Entries {
    /**
     * エントリを追加します。
     * @param entry エントリ
     */
    add(entry: Entry): void;

    /**
     * エントリのリストを上書きします。
     * @param entries エントリのリスト
     */
    set(entries: Entry[]): void;

    /**
     * 読み取り専用のエントリのリストを返します。
     */
    get(): readonly Entry[];

    /**
     * エントリを削除します。
     * @param entry エントリ
     */
    delete(entry: Entry): void;
}

class LootTable {
    /**
     * ルートテーブルを作成します。
     * @param id ID
     */
    constructor(id: string);

    /**
     * ID
     */
    readonly id: string;

    /**
     * プールのリスト
     */
    readonly pools: Pools;

    /**
     * ルートテーブルから抽選します。
     */
    roll(): ItemStack[];

    /**
     * コンテナをこのルートテーブルから抽選したアイテムで満たします。
     * @param container コンテナ
     */
    fill(container: Container): Container;

    /**
     * 指定した場所にこのルートテーブルから抽選したアイテムのエンティティを召喚します。
     * @param dimension ディメンション
     * @param location 座標
     */
    spawn(dimension: Dimension, location: Vector3): void;

    /**
     * jsonからルートテーブルを作成します。
     * @param id ID
     * @param json ルートテーブルのJSONテキストフォーマット
     */
    static create(id: string, json: LootTableJSONTextFormat): LootTable;

    /**
     * IDからルートテーブルを取得します。
     * @param id ID
     */
    static get(id: string): LootTable;

    static readonly prototype;
}

interface Pools {
    /**
     * プールを追加します。
     * @param pool プール
     */
    add(pool: Pool): void;

    /**
     * プールのリストを上書きします。
     * @param pools プールのリスト
     */
    set(pools: Pool[]): void;

    /**
     * 読み取り専用のプールのリストを返します。
     */
    get(): readonly Pool[];

    /**
     * プールを削除します。
     * @param pool プール
     */
    delete(pool: Pool): void;
}

interface LootTableJSONTextFormat {
    /**
     * プールのリスト
     */
    readonly pools: {
        /**
         * 抽選する回数
         */
        readonly rolls: number;

        /**
         * エントリのリスト
         */
        readonly entries: {
            /**
             * 確率
             */
            readonly weight: number;

            /**
             * 内容
             */
            readonly value: ItemStack | LootTable;
        }[];
    }[]
}
