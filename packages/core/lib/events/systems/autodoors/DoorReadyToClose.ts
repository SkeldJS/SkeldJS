import { BasicEvent } from "@skeldjs/events";

import { StatefulRoom } from "../../../StatefulRoom";
import { RoomEvent } from "../../RoomEvent";
import { AutoDoorsSystem, AutoOpenDoor } from "../../../systems";
import { AutoDoorsSystemEvent } from "./AutoDoorsSystemEvent";

export class AutoDoorsSystemDoorReadyToCloseEvent<RoomType extends StatefulRoom> extends BasicEvent implements RoomEvent<RoomType>, AutoDoorsSystemEvent<RoomType> {
    static eventName = "systems.autodoors.doorreadytoclose" as const;
    eventName = "systems.autodoors.doorreadytoclose" as const;

    originMessage: null;

    constructor(
        public readonly system: AutoDoorsSystem<RoomType>,
        public readonly door: AutoOpenDoor<RoomType>,
    ) {
        super();

        this.originMessage = null;
    }

    get room() {
        return this.system.room;
    }

    get shipStatus() {
        return this.system.shipStatus;
    }
}
