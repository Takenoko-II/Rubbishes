import * as Minecraft from "@minecraft/server";

declare module "@minecraft/server" {
    interface WorldBeforeEvents {
        /**
         * @stable
         * このイベントはプレイヤーがブロックへの右クリックを開始したとき発火します。
         */
        readonly playerStartInteractWithBlock: PlayerStartInteractWithBlockBeforeEventSignal;
    }

    interface PlayerStartInteractWithBlockBeforeEvent {
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

        /**
         * キャンセル
         */
        cancel: boolean;
    }

    interface PlayerStartInteractWithBlockBeforeEventSignal {
        /**
         * コールバックを登録します。
         * @param callback コールバック関数
         */
        subscribe(callback: (arg: PlayerStartInteractWithBlockBeforeEvent) => void): (arg: PlayerStartInteractWithBlockBeforeEvent) => void
    
        /**
         * コールバックの登録を解除します。
         * @param callback コールバック関数
         */
        unsubscribe(callback: (arg: PlayerStartInteractWithBlockBeforeEvent) => void): (arg: PlayerStartInteractWithBlockBeforeEvent) => void
    }
}
