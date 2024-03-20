import "./prototypePollution/index";

import "./commands";

import { world, system, Player, EquipmentSlot, ItemStack } from "@minecraft/server";

import { ChatCommandBuilder } from "./ChatCommand/index";

import { getGrapplingHook } from "./GrapplingHook"

function getFeatherLeggings() {
    const featherLeggings = new ItemStack("minecraft:iron_leggings");

    featherLeggings.nameTag = "§r§6Feather Leggings";
    featherLeggings.setDynamicProperty("data", "FeatherLeggings");

    return featherLeggings;
}

ChatCommandBuilder.register("@give")
.parameters.define("id", { type: "string" })
.parameters.define("count", { type: "number", isOptional: true, defaultValue: 1 })
.onExecute(({ player, parameters }) => {
    switch (parameters.get("id")) {
        case "FeatherLeggings": {
            player.give(getFeatherLeggings());
            break;
        }
        case "GrapplingHook": {
            player.give(getGrapplingHook());
            break;
        }
        default: {
            const item = new ItemStack(parameters.get("id"), parameters.get("count"));
            player.give(item);
        }
    }

    return true;
});

/**
 * @type {Map<Player, number>}
 */
const playerIsNotOnGroundTimeMap = new Map();

/**
 * @type {Map<Player, number>}
 */
const playerIsJumpingTimeMap = new Map();

/**
 * @type {Map<Player, boolean>}
 */
const playerIsEnabledFlagMap = new Map();

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const feetItem = player.getComponent("equippable").getEquipment(EquipmentSlot.Legs);

        if (!feetItem) return;

        if (feetItem.getDynamicProperty("data") !== "FeatherLeggings") return;

        player.addEffect("jump_boost", 3, { showParticles: false, amplifier: 1 });

        const jumpingTime = playerIsJumpingTimeMap.get(player) ?? 0;
        const notOnGroundTime = playerIsNotOnGroundTimeMap.get(player) ?? 0;
        const flag = playerIsEnabledFlagMap.get(player) ?? true;

        if (jumpingTime === 1 && notOnGroundTime > 1 && flag && !player.isFlying) {
            const { x, z } = player.getViewDirection();
            player.applyKnockback(x, z, 2, 1);

            player.dimension.playSound("mob.enderdragon.flap", player.location, { volume: 3 });
            player.dimension.spawnParticle("minecraft:dragon_destroy_block", player.location);

            playerIsEnabledFlagMap.set(player, false);
        }

        if (!flag) player.addEffect("slow_falling", 1, { showParticles: false });

        if (player.isJumping) playerIsJumpingTimeMap.set(player, jumpingTime + 1);
        else playerIsJumpingTimeMap.set(player, 0);

        if (player.isOnGround) {
            playerIsNotOnGroundTimeMap.set(player, 0);
            playerIsEnabledFlagMap.set(player, true);
        }
        else playerIsNotOnGroundTimeMap.set(player, notOnGroundTime + 1);
    }
});




import { LootTable, Pool, Entry, utils, Random } from "./lib/index";

const jewelriesTable = new LootTable("jewel");

const jewelriesPool = new Pool(5);

jewelriesPool.entries.set([
    new Entry(new ItemStack("emerald", 10), 1),
    new Entry(new ItemStack("diamond", 10), 2),
    new Entry(new ItemStack("gold_ingot", 10), 3),
    new Entry(new ItemStack("amethyst_shard", 10), 3),
    new Entry(new ItemStack("redstone", 10), 4),
    new Entry(new ItemStack("lapis_lazuli", 10), 4),
    new Entry(new ItemStack("iron_ingot", 10), 4),
    new Entry(new ItemStack("coal", 10), 5)
]);

jewelriesTable.pools.add(jewelriesPool);

const mainTable = new LootTable("main");

const mainPool = new Pool(3);

mainPool.entries.set([
    new Entry(jewelriesTable),
    new Entry(new ItemStack("cobblestone", 10), 2)
    .functions.count({ min: 1, max: 64 }),
    new Entry(new ItemStack("andesite", 10), 2),
    new Entry(new ItemStack("stone", 10), 2),
    new Entry(new ItemStack("gravel", 10), 2),
    new Entry("wooden_sword", 5)
    .functions.damage({ min: 0, max: 64 })
    .functions.enchantments.set([
        {
            "id": "smite",
            "level": 4
        },
        {
            "id": "unbreaking",
            "level": 2
        }
    ])
]);

mainTable.pools.add(mainPool);

world.afterEvents.playerStartInteractWithBlock.subscribe(({ block }) => {
    if (block.type.id !== "minecraft:chest") return;

    mainTable.fill(block.getComponent("inventory").container);
});
