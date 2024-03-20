import { world, Block, Direction, Player, ItemStack, PlayerInteractWithBlockBeforeEvent } from "@minecraft/server";

/**
 * @type {Set<(arg: PlayerStartInteractWithBlockBeforeEvent) => void>}
 */
const callbacks = new Set();

class PlayerStartInteractWithBlockBeforeEvent {
    /**
     * @param {PlayerInteractWithBlockBeforeEvent} event 
     */
    constructor(event) {
        this.player = event.player;
        this.block = event.block;
        this.blockFace = event.blockFace;
        this.faceLocation = event.faceLocation;
        this.itemStack = event.itemStack;

        this.#event = event;
    }

    #event;

    get cancel() {
        return this.#event.cancel;
    }

    set cancel(value) {
        if (typeof value !== "boolean") {
            throw TypeError();
        }

        this.#event.cancel = value;
    }
}

export class PlayerStartInteractWithBlockBeforeEventSignal {
    /**
     * @param {(arg: PlayerStartInteractWithBlockBeforeEvent) => void} callback 
     * @returns {(arg: PlayerStartInteractWithBlockBeforeEvent) => void}
     */
    subscribe(callback) {
        /**
         * @type {Map<Player, number>}
         */
        const playerLastInteractedTimestamps = new Map();

        if (callbacks.has(callback)) {
            throw new Error("その関数は既にこのイベントに登録されています");
        }

        callbacks.add(callback);

        world.beforeEvents.playerInteractWithBlock.subscribe(event => {
            const lastInteracted = playerLastInteractedTimestamps.get(event.player) ?? 0;
            playerLastInteractedTimestamps.set(event.player, Date.now());

            if (Date.now() - lastInteracted > 100) {
                callback(new PlayerStartInteractWithBlockBeforeEvent(event));
            }
        });

        return callback;
    }

    /**
     * @param {(arg: PlayerStartInteractWithBlockBeforeEvent) => void} callback 
     * @returns {(arg: PlayerStartInteractWithBlockBeforeEvent) => void}
     */
    unsubscribe(callback) {
        if (callbacks.has(callback)) callbacks.delete(callback);

        return callback;
    }
}
