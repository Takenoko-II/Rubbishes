import { WorldAfterEvents } from "@minecraft/server";

import { PlayerStartInteractWithBlockAfterEventSignal } from "./PlayerStartInteractWithBlockAfterEvent";

import { PlayerStartSneakAfterEventSignal } from "./PlayerStartSneakAfterEvent";

import { ItemUsingAfterEventSignal } from "./ItemUsingAfterEvent";

WorldAfterEvents.prototype.playerStartInteractWithBlock = new PlayerStartInteractWithBlockAfterEventSignal();

WorldAfterEvents.prototype.playerStartSneak = new PlayerStartSneakAfterEventSignal();

WorldAfterEvents.prototype.itemUsing = new ItemUsingAfterEventSignal();
