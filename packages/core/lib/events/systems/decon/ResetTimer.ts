import { RevertableEvent } from "@skeldjs/events";
import { DeconSystemDataMessage, DeconSystemMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../../StatefulRoom";
import { RoomEvent } from "../../RoomEvent";
import { DeconSystem } from "../../../systems";
import { DeconSystemEvent } from "./DeconSystemEvent";

export class DeconSystemResetTimerEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType>, DeconSystemEvent<RoomType> {
    static eventName = "systems.decon.resettimer" as const;
    eventName = "systems.decon.resettimer" as const;

    constructor(
        public readonly system: DeconSystem<RoomType>,
        public readonly originMessage: DeconSystemDataMessage|DeconSystemMessage|null,
        public readonly newTimer: number,
    ) {
        super();
    }

    get room() {
        return this.system.room;
    }

    get shipStatus() {
        return this.system.shipStatus;
    }
}
