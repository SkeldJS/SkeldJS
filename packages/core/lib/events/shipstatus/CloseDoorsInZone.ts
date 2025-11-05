import { CancelableEvent } from "@skeldjs/events";
import { CloseDoorsOfTypeMessage } from "@skeldjs/au-protocol";
import { SystemType } from "@skeldjs/au-constants";

import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";
import { ShipStatus } from "../../objects";
import { ShipStatusEvent } from "./ShipStatusEvent";

export class ShipStatusCloseDoorsInZoneRequestEvent<RoomType extends StatefulRoom> extends CancelableEvent implements RoomEvent<RoomType>, ShipStatusEvent<RoomType> {
    static eventName = "shipstatus.closedoorsinzonerequest" as const;
    eventName = "shipstatus.closedoorsinzonerequest" as const;

    constructor(
        public readonly shipStatus: ShipStatus<RoomType>,
        public readonly originMessage: CloseDoorsOfTypeMessage|null,
        public readonly zone: SystemType,
    ) {
        super();
    }

    get room() {
        return this.shipStatus.room;
    }
}
