import { world } from "@minecraft/server";

import { ChatCommandBuilder } from "./builder";

world.beforeEvents.chatSend.subscribe(event => {
    const success = ChatCommandBuilder.execute(event.sender, event.message);
    if (success) event.cancel = true;
});
