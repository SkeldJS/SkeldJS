import { RevertableEvent } from "@skeldjs/events";
import { AutoDoorsSystemDataMessage, AutoDoorsSystemSpawnDataMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../../StatefulRoom";
import { RoomEvent } from "../../RoomEvent";
import { AutoDoor, AutoDoorsSystem } from "../../../systems";
import { AutoDoorsSystemEvent } from "./AutoDoorsSystemEvent";

export class AutoDoorsSystemCloseDoorEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType>, AutoDoorsSystemEvent<RoomType> {
    static eventName = "systems.autodoors.closedoor" as const;
    eventName = "systems.autodoors.closedoor" as const;

    constructor(
        public readonly system: AutoDoorsSystem<RoomType>,
        public readonly originMessage: AutoDoorsSystemSpawnDataMessage|AutoDoorsSystemDataMessage|null,
        public readonly door: AutoDoor<RoomType>,
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
