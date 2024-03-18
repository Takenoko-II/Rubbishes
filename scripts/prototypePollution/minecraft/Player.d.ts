import * as minecraft from "@minecraft/server";

declare module "@minecraft/server" {
    interface Player {
        /**
         * プレイヤーのインベントリに/giveコマンドと同様の挙動でアイテムを入れます。
         * @param itemStack アイテム
         */
        give(itemStack: ItemStack): void;
    }
}
