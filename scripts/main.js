import "./prototypePollution/index";

import "./commands";

import { GameMode, ItemStack, world } from "@minecraft/server";

import { ActionFormBuilder, ModalFormBuilder, MessageFormBuilder } from "./lib/index";

new ActionFormBuilder().title("run command")
.body("cmd")
.button("kill").on(player => {
    player.kill();
})
.button("gamemode").on(player => {
    const mode = player.getGameMode();
    if (mode === GameMode.creative) player.setGameMode(GameMode.survival);
    else player.setGameMode(GameMode.creative);
})
.show(world.getAllPlayers()[0])



new ModalFormBuilder().title("give")
.dropdown("itemId", "ID", ["apple", "wooden_sword", "stone", "command_block", "cookie"])
.slider("itemCount", "COUNT", { min: 1, max: 64 })
.onSubmit(e => {
    const item = new ItemStack(e.get("itemId"), e.get("itemCount"));
    e.player.getComponent("inventory").container.addItem(item);
})
.show(world.getAllPlayers()[0]);



new MessageFormBuilder()
.body("body----")
.button1("1").on(player => {
    player.teleport({ x: 0, y: 0, z: 0 });
})
.button2("2").pass
.cancelation.on("UserClosed", player => {
    player.sendMessage("closed");
})
.onPush(e => {
    e.player.sendMessage("You selected " + e.buttonName);
})
.show(world.getAllPlayers()[0]);
