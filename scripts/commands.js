import "./ChatCommand/index";

import { ChatCommandBuilder } from "./ChatCommand/index";

import { MultiDimensionalVector } from "./lib/index";

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

ChatCommandBuilder.register("@chat_command")
.setPermissionLevel(1)
.setStrictMode()
.parameters.define("mode", { type: "string" })
.onExecute(event => {
    switch (event.parameters.get("mode")) {
        case "list": return ChatCommandBuilder.commands.getAll().map(_ => _.frozen());
        default: throw new Error();
    }
});
