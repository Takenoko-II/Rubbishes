import { PlayerStartInteractWithBlockAfterEventSignal } from "./PlayerStartInteractWithBlockAfterEvent";

declare module "@minecraft/server" {
    interface WorldAfterEvents {
        /**
         * @stable
         * このイベントはプレイヤーがブロックへの右クリックを開始したとき発火します。
         */
        readonly playerStartInteractWithBlock: PlayerStartInteractWithBlockAfterEventSignal;
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
}
