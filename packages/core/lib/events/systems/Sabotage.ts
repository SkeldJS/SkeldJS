import { RevertableEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";
import { ShipStatus } from "../../objects";
import { SabotagableSystem } from "../../systems";

export class SystemSabotageEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType> {
    static eventName = "system.sabotage" as const;
    eventName = "system.sabotage" as const;

    constructor(
        public readonly room: RoomType,
        public readonly shipStatus: ShipStatus<RoomType>,
        public readonly system: SabotagableSystem<RoomType>,
    ) {
        super();
    }
}
