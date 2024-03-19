import { world, system, Player, Entity, EquipmentSlot, ItemStack, EntityEquippableComponent } from "@minecraft/server";

import { MultiDimensionalVector } from "./lib/index";

/**
 * @type {Map<Entity, Player>}
 */
const hookOwnerMap = new Map();

/**
 * @param {Player} player 
 * @returns {boolean}
 */
function isHoldingGrrapplingHook(player) {
    const selectedItem = player.getComponent(EntityEquippableComponent.componentId).getEquipment(EquipmentSlot.Mainhand);

    if (!selectedItem) return false;
    if (selectedItem.getDynamicProperty("data") === "GrapplingHook") return true;
    return false;
}

world.afterEvents.projectileHitBlock.subscribe(event => {
    if (!(event.projectile.typeId === "minecraft:fishing_hook" && isHoldingGrrapplingHook(event.source))) return;

    hookOwnerMap.set(event.projectile, event.source);

    event.dimension.spawnParticle("minecraft:critical_hit_emitter", MultiDimensionalVector.const("up").add(event.projectile.location));
    
    const handle = system.runInterval(() => {
        if (!world.getEntity(event.projectile.id) || event.getBlockHit().block.isAir) {
            system.clearRun(handle);
            return;
        }
        event.projectile.teleport(event.location);
    });
});

world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
    const owner = hookOwnerMap.get(removedEntity);

    if (!(removedEntity.typeId === "minecraft:fishing_hook" && owner instanceof Player)) return;

    hookOwnerMap.delete(removedEntity);

    if (!isHoldingGrrapplingHook(owner)) return;

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
        horizontal: Math.sqrt(Math.abs(dx) + Math.abs(dz)) * 1.2,
        vertical: (dy === 0) ? 0.3 : Math.sqrt(Math.abs(dy) * 0.22) * sign
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
    if (!isHoldingGrrapplingHook(source)) return;

    source.playSound("random.door_open", { volume: 10, pitch: 2 });
});

/**
 * @returns {ItemStack}
 */
export function getGrapplingHook() {
    const grapplingHook = new ItemStack("minecraft:fishing_rod");

    grapplingHook.nameTag = "§r§6Grappling Hook";
    grapplingHook.setDynamicProperty("data", "GrapplingHook");

    return grapplingHook;
}
