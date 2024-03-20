import { world, Player, ItemStack, system, EquipmentSlot } from "@minecraft/server";

/**
 * @type {Set<(arg: ItemUsingAfterEvent) => void>}
 */
const callbacks = new Set();

/**
 * @type {Map<Player, { itemStack: ItemStack, useDuration: number }>}
 */
const playerItemUsingStateMap = new Map();

world.afterEvents.itemStartUse.subscribe(({ source, itemStack }) => {
    playerItemUsingStateMap.set(source, { itemStack, useDuration: 0 });
});

world.afterEvents.itemStopUse.subscribe(({ source }) => {
    playerItemUsingStateMap.delete(source);
});

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const state = playerItemUsingStateMap.get(player);

        if (state === undefined) return;

        callbacks.forEach(callback => {
            callback(new ItemUsingAfterEvent(player, state.itemStack, state.useDuration));
        });

        const selectedItem = player.getComponent("equippable").getEquipment(EquipmentSlot.Mainhand);

        if (state.itemStack.type.id === selectedItem.type.id) {
            state.useDuration++;
            playerItemUsingStateMap.set(player, state);
        }
        else if (selectedItem !== undefined) {
            state.useDuration = 0;
            state.itemStack = selectedItem;
            playerItemUsingStateMap.set(player, state);
        }
        else {
            playerItemUsingStateMap.delete(player);
        }
    }
});

class ItemUsingAfterEvent {
    /**
     * @param {Player} source 
     * @param {ItemStack | undefined} itemStack 
     * @param {number} useDuration 
     */
    constructor(source, itemStack, useDuration) {
        this.source = source;
        this.itemStack = itemStack;
        this.useDuration = useDuration;
    }
}

export class ItemUsingAfterEventSignal {
    /**
     * @param {(arg: ItemUsingAfterEvent) => void} callback 
     * @returns {(arg: ItemUsingAfterEvent) => void}
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
     * @param {(arg: ItemUsingAfterEvent) => void} callback 
     * @returns {(arg: ItemUsingAfterEvent) => void}
     */
    unsubscribe(callback) {
        if (callbacks.has(callback)) callbacks.delete(callback);

        return callback;
    }
}
