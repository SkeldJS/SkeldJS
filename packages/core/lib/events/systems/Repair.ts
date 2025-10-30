import { RevertableEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";
import { ShipStatus } from "../../objects";
import { SabotagableSystem } from "../../systems";

export class SystemRepairEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType> {
    static eventName = "system.repair" as const;
    eventName = "system.repair" as const;

    constructor(
        public readonly room: RoomType,
        public readonly shipStatus: ShipStatus<RoomType>,
        public readonly system: SabotagableSystem<RoomType>,
    ) {
        super();
    }
}
