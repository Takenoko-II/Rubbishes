import { world } from "@minecraft/server";

import { utils } from "../lib/index";

Object.prototype.cons = function() {
    utils.out(this);
}

Object.prototype.chat = function() {
    const message = utils.stringify(this);
    world.sendMessage(message);
}
