import "./ChatCommand/index";

import "./prototypePollution/index";

import { ChatCommandBuilder } from "./ChatCommand/index";

import { MultiDimensionalVector, Tuple, utils } from "./lib/index";

ChatCommandBuilder.register("@g")
.setPermissionLevel(1)
.onExecute(({ player }) => {
    const gameMode = player.getGameMode();
    
    if (gameMode === "creative") player.setGameMode("survival");
    else player.setGameMode("creative");

    player.spawnParticle("minecraft:critical_hit_emitter", new MultiDimensionalVector(player.location).add({ x: 0, y: 1.5, z: 0 }));
    player.playSound("random.click", { volume: 10, pitch: 1 });

    return player.getGameMode();
});
