import { RevertableEvent } from "@skeldjs/events";
import { DoorsSystemDataMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../../StatefulRoom";
import { RoomEvent } from "../../RoomEvent";
import { DoorsSystemEvent } from "./DoorsSystemEvent";
import { DoorsSystem, ManualDoor } from "../../../systems";

export class DoorsSystemCloseDoorEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType>, DoorsSystemEvent<RoomType> {
    static eventName = "systems.doors.closedoor" as const;
    eventName = "systems.doors.closedoor" as const;

    constructor(
        public readonly system: DoorsSystem<RoomType>,
        public readonly originMessage: DoorsSystemDataMessage|null,
        public readonly door: ManualDoor<RoomType>,
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
