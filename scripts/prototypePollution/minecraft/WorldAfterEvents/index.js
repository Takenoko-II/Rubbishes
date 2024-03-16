import { WorldAfterEvents } from "@minecraft/server";

import { PlayerStartInteractWithBlockAfterEventSignal } from "./PlayerStartInteractWithBlockAfterEvent";

WorldAfterEvents.prototype.playerStartInteractWithBlock = new PlayerStartInteractWithBlockAfterEventSignal();
