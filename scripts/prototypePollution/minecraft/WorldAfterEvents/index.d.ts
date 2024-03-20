import * as Minecraft from "@minecraft/server";

declare module "@minecraft/server" {
    interface WorldAfterEvents {
        /**
         * @stable
         * このイベントはプレイヤーがブロックへの右クリックを開始したとき発火します。
         */
        readonly playerStartInteractWithBlock: PlayerStartInteractWithBlockAfterEventSignal;

        /**
         * @stable
         * このイベントはプレイヤーがスニークを開始したとき発火します。
         */
        readonly playerStartSneak: PlayerStartSneakAfterEventSignal;

        /**
         * @stable
         * このイベントはプレイヤーがアイテムを使用している間発火します。
         */
        readonly itemUsing: ItemUsingAfterEventSignal;
    }

    interface PlayerStartInteractWithBlockAfterEvent {
        /**
         * 右クリックしたプレイヤー
         */
        readonly player: Player;
    
        /**
         * 右クリックされたブロック
         */
        readonly block: Block;
    
        /**
         * 右クリックされた面
         */
        readonly blockFace: Direction;
    
        /**
         * 右クリックされた座標
         */
        readonly faceLocation: Vector3;
    
        /**
         * プレイヤーが持っているアイテム
         */
        readonly itemStack?: ItemStack;
    }

    interface PlayerStartInteractWithBlockAfterEventSignal {
        /**
         * コールバックを登録します。
         * @param callback コールバック関数
         */
        subscribe(callback: (arg: PlayerStartInteractWithBlockAfterEvent) => void): (arg: PlayerStartInteractWithBlockAfterEvent) => void
    
        /**
         * コールバックの登録を解除します。
         * @param callback コールバック関数
         */
        unsubscribe(callback: (arg: PlayerStartInteractWithBlockAfterEvent) => void): (arg: PlayerStartInteractWithBlockAfterEvent) => void
    }

    interface PlayerStartSneakAfterEvent {
        /**
         * プレイヤー
         */
        readonly player: Player;
    }

    interface PlayerStartSneakAfterEventSignal {
        /**
         * コールバックを登録します。
         * @param callback コールバック関数
         */
        subscribe(callback: (arg: PlayerStartSneakAfterEvent) => void): (arg: PlayerStartSneakAfterEvent) => void
    
        /**
         * コールバックの登録を解除します。
         * @param callback コールバック関数
         */
        unsubscribe(callback: (arg: PlayerStartSneakAfterEvent) => void): (arg: PlayerStartSneakAfterEvent) => void
    }

    interface ItemUsingAfterEvent {
        /**
         * プレイヤー
         */
        readonly source: Player;

        /**
         * アイテム
         */
        readonly itemStack: ItemStack;

        /**
         * 使用時間
         */
        readonly useDuration: number;
    }

    interface ItemUsingAfterEventSignal {
        /**
         * コールバックを登録します。
         * @param callback コールバック関数
         */
        subscribe(callback: (arg: ItemUsingAfterEvent) => void): (arg: ItemUsingAfterEvent) => void

        /**
         * コールバックの登録を解除します。
         * @param callback コールバック関数
         */
        unsubscribe(callback: (arg: ItemUsingAfterEvent) => void): (arg: ItemUsingAfterEvent) => void
    }
}
