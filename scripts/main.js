import "./prototypePollution/index";

import "./commands";

import { world, system, Player, Entity, EquipmentSlot, ItemStack } from "@minecraft/server";

import { MultiDimensionalVector, Numeric, utils } from "./lib/index";

import { ChatCommandBuilder } from "./ChatCommand/index";

/**
 * @type {Map<Entity, Player>}
 */
const hookOwnerMap = new Map();

/**
 * @param {Player} player 
 * @returns {boolean}
 */
function isHoldingRrapplingHook(player) {
    const selectedItem = player.getComponent("equippable").getEquipment(EquipmentSlot.Mainhand);

    if (!selectedItem) return false;
    if (selectedItem.getDynamicProperty("data") === "GrapplingHook") {
        return true;
    }
    return false;
}

world.afterEvents.projectileHitBlock.subscribe(({ source, projectile, location, dimension }) => {
    if (!(projectile.typeId === "minecraft:fishing_hook" && isHoldingRrapplingHook(source))) return;

    hookOwnerMap.set(projectile, source);

    dimension.spawnParticle("minecraft:critical_hit_emitter", MultiDimensionalVector.const("up").add(projectile.location));
    
    const handle = system.runInterval(() => {
        if (!world.getEntity(projectile.id)) {
            system.clearRun(handle);
            return;
        }
        projectile.teleport(location);
    });
});

world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
    const owner = hookOwnerMap.get(removedEntity);

    if (!(removedEntity.typeId === "minecraft:fishing_hook" && owner instanceof Player)) return;

    hookOwnerMap.delete(removedEntity);

    if (!isHoldingRrapplingHook(owner)) return;

    const location = new MultiDimensionalVector(removedEntity.location);
    if (location.getDistanceTo(owner.location) >= 32) return;

    const { x: vx, y: vy, z: vz } = owner.getVelocity();
    const velocity = {
        horizontal: Math.sqrt(Math.abs(vx) + Math.abs(vz)) * 0.25,
        vertical: Math.sqrt(Math.abs(vx) + Math.abs(vz)) * 0.25 + vy * 0.25
    };

    const { x: dx, y: dy, z: dz } = location.subtract(owner.location);
    const sign = (location.y >= owner.location.y) ? 1 : -1;
    const strength = {
        horizontal: Math.sqrt(Math.abs(dx) + Math.abs(dz)),
        vertical: (dy === 0) ? 0.3 : Math.sqrt(Math.abs(dy) * 0.175) * sign
    }

    system.runTimeout(() => {
        owner.applyKnockback(dx, dz, strength.horizontal + velocity.horizontal, strength.vertical + velocity.vertical);
        owner.playSound( "open.iron_door", { volume: 10, pitch: 0.75 } );
        owner.dimension.spawnParticle("minecraft:critical_hit_emitter", location.add({ x: 0, y: 1, z: 0 }));
    });

    let t = 0;
    const handle = system.runInterval(() => {
        owner.addEffect("slow_falling", 1, { showParticles: false });

        if (owner.isOnGround && t > 0) system.clearRun(handle);
        if (t === 0) t++;
    });
});

world.afterEvents.itemUse.subscribe(({ source }) => {
    if (!isHoldingRrapplingHook(source)) return;

    source.playSound("random.door_open", { volume: 10, pitch: 2 });
});

function getGrapplingHook() {
    const grapplingHook = new ItemStack("minecraft:fishing_rod");

    grapplingHook.nameTag = "§r§6Grappling Hook";
    grapplingHook.setDynamicProperty("data", "GrapplingHook");

    return grapplingHook;
}

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

import { LootTable, Pool, Entry } from "./lib/index";

const lootTable = new LootTable("hoge");

const pool = new Pool(1);

pool.entries.set([
    new Entry(new ItemStack("apple", 1), 1),
    new Entry(new ItemStack("stick", 1), 4)
]);

lootTable.pools.set([
    pool
]);

const table2 = new LootTable("fuga");
const pool2 = new Pool(1);
pool2.entries.set([
    new Entry(lootTable, 1),
    new Entry(new ItemStack("command_block"), 1)
]);
table2.pools.add(pool2);

ChatCommandBuilder.register("@loot")
.parameters.define("count", { type: "number" })
.onExecute(a => {
    for (let i = 0; i < a.parameters.get("count"); i++) {
        table2.roll().forEach(i => {
            a.player.give(i);
        });
    }
    return true;
});
