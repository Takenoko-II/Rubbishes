import { Container, ItemStack } from "@minecraft/server";

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
    get(): ItemStack[];
}

class Pool {
    /**
     * プールを作成します。
     * @param rolls 回す回数
     */
    constructor(rolls?: number);

    /**
     * 回す回数
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
     * エントリのリストを設定します。
     * @param entries エントリのリスト
     */
    set(entries: Entry[]): void;

    /**
     * 読み取り専用のエントリのリストを返します。
     */
    get(): readonly Entry[];
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
     * コンテナをこのルートテーブルの内容で満たします。
     * @param container コンテナ
     */
    fill(container: Container): Container;
}

interface Pools {
    /**
     * プールを追加します。
     * @param pool プール
     */
    add(pool: Pool): void;

    /**
     * プールのリストを設定します。
     * @param pools プールのリスト
     */
    set(pools: Pool[]): void;

    /**
     * 読み取り専用のプールのリストを返します。
     */
    get(): readonly Pool[];
}
