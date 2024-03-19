import { Container, Dimension, ItemStack, Player, Vector3 } from "@minecraft/server";

class Entry {
    /**
     * エントリを作成します。
     * @param value 値
     * @param weight 確率
     */
    constructor(value: ItemStack | LootTable, weight?: number);

    /**
     * 確率
     */
    weight: number;

    /**
     * エントリタイプ
     */
    readonly type: "item" | "empty" | "loot_table";

    /**
     * このエントリが返すアイテムの配列
     */
    getItemStacks(): ItemStack[];
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
