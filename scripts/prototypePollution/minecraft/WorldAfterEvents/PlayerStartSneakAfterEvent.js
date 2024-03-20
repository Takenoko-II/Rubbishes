import { world, Player, system } from "@minecraft/server";

/**
 * @type {Set<(arg: PlayerStartSneakAfterEvent) => void>}
 */
const callbacks = new Set();

/**
 * @type {Map<Player, number>}
 */
const playerSneakTimeMap = new Map();

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const sneakTime = playerSneakTimeMap.get(player) ?? 0;

        if (player.isSneaking) playerSneakTimeMap.set(player, sneakTime + 1);
        else playerSneakTimeMap.set(player, 0);

        if (sneakTime === 1) {
            callbacks.forEach(callback => {
                callback(new PlayerStartSneakAfterEvent(player));
            });
        }
    }
});

class PlayerStartSneakAfterEvent {
    /**
     * @param {Player} player 
     */
    constructor(player) {
        this.player = player;
    }
}

export class PlayerStartSneakAfterEventSignal {
    /**
     * @param {(arg: PlayerStartSneakAfterEvent) => void} callback 
     * @returns {(arg: PlayerStartSneakAfterEvent) => void}
     */
    subscribe(callback) {
        if (typeof callback !== "function") {
            throw TypeError();
        }

        if (callbacks.has(callback)) {
            throw new Error("その関数は既にこのイベントに登録されています");
        }

        callbacks.add(callback);

        return callback;
    }

    /**
     * @param {(arg: PlayerStartSneakAfterEvent) => void} callback 
     * @returns {(arg: PlayerStartSneakAfterEvent) => void}
     */
    unsubscribe(callback) {
        if (callbacks.has(callback)) callbacks.delete(callback);

        return callback;
    }
}
