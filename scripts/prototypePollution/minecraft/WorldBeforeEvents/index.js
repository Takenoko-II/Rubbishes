import { WorldBeforeEvents } from "@minecraft/server";

import { PlayerStartInteractWithBlockBeforeEventSignal } from "./PlayerStartInteractWithBlockBeforeEvent";

WorldBeforeEvents.prototype.playerStartInteractWithBlock = new PlayerStartInteractWithBlockBeforeEventSignal();
