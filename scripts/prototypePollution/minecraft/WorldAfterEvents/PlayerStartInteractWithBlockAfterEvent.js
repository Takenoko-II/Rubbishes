import { world, Block, Direction, Player, ItemStack } from "@minecraft/server";

/**
 * @type {Set<(arg: PlayerStartInteractWithBlockAfterEvent) => void>}
 */
const callbacks = new Set();

class PlayerStartInteractWithBlockAfterEvent {
    /**
     * @param {Player} player 
     * @param {Block} block 
     * @param {Direction} blockFace 
     * @param {import("@minecraft/server").Vector3} faceLocation 
     * @param {ItemStack | undefined} itemStack 
     */
    constructor(player, block, blockFace, faceLocation, itemStack) {
        this.player = player;
        this.block = block;
        this.blockFace = blockFace;
        this.faceLocation = faceLocation;
        this.itemStack = itemStack;
    }
}

export class PlayerStartInteractWithBlockAfterEventSignal {
    /**
     * @param {(arg: PlayerStartInteractWithBlockAfterEvent) => void} callback 
     * @returns {(arg: PlayerStartInteractWithBlockAfterEvent) => void}
     */
    subscribe(callback) {
        if (typeof callback !== "function") {
            throw TypeError();
        }

        /**
         * @type {Map<Player, number>}
         */
        const playerLastInteractedTimestamps = new Map();

        if (callbacks.has(callback)) {
            throw new Error("その関数は既にこのイベントに登録されています");
        }

        callbacks.add(callback);

        world.afterEvents.playerInteractWithBlock.subscribe(({ player, block, blockFace, faceLocation, itemStack }) => {
            const lastInteracted = playerLastInteractedTimestamps.get(player) ?? 0;
            playerLastInteractedTimestamps.set(player, Date.now());

            if (Date.now() - lastInteracted > 100) {
                callback(new PlayerStartInteractWithBlockAfterEvent(player, block, blockFace, faceLocation, itemStack));
            }
        });

        return callback;
    }

    /**
     * @param {(arg: PlayerStartInteractWithBlockAfterEvent) => void} callback 
     * @returns {(arg: PlayerStartInteractWithBlockAfterEvent) => void}
     */
    unsubscribe(callback) {
        if (callbacks.has(callback)) callbacks.delete(callback);

        return callback;
    }
}
