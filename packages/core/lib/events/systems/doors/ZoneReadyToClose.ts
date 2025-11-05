import { RevertableEvent } from "@skeldjs/events";
import { DoorsSystemDataMessage } from "@skeldjs/au-protocol";
import { SystemType } from "@skeldjs/au-constants";

import { StatefulRoom } from "../../../StatefulRoom";
import { RoomEvent } from "../../RoomEvent";
import { DoorsSystem } from "../../../systems";
import { DoorsSystemEvent } from "./DoorsSystemEvent";

export class DoorsSystemZoneReadyToCloseEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType>, DoorsSystemEvent<RoomType> {
    static eventName = "systems.doors.zonereadytoclose" as const;
    eventName = "systems.doors.zonereadytoclose" as const;

    constructor(
        public readonly system: DoorsSystem<RoomType>,
        public readonly originMessage: DoorsSystemDataMessage|null,
        public readonly zone: SystemType,
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
