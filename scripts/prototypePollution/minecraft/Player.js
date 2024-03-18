import { Player, ItemStack } from "@minecraft/server";

Player.prototype.give = function(itemStack) {
    if (!(itemStack instanceof ItemStack)) {
        throw new TypeError();
    }

    const container = this.getComponent("inventory").container;

    let remainAmount = itemStack.amount;

    for (let i = 0; i < container.size; i++) {
        const slot = container.getSlot(i);

        if (!slot.hasItem()) continue;
        if (slot.isStackableWith(itemStack)) {
            let addend = Math.min(slot.amount + remainAmount, itemStack.maxAmount) - slot.amount;
            remainAmount -= addend;
            slot.amount += addend;
        }
    }

    if (remainAmount > 0) {
        for (let i = 0; i < container.size; i++) {
            if (remainAmount <= 0) break;
            if (container.getItem(i)) continue;
            itemStack.amount = Math.min(remainAmount, itemStack.maxAmount);
            container.setItem(i, itemStack);
            remainAmount -= itemStack.maxAmount;
        }
    }
}
