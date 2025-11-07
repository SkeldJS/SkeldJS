import { RevertableEvent } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { RoomEvent } from "../RoomEvent";
import { SabotagableSystem } from "../../systems";
import { Player } from "../../Player";
import { BaseDataMessage, BaseSystemMessage } from "@skeldjs/au-protocol";

export class SystemRepairEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType> {
    static eventName = "system.repair" as const;
    eventName = "system.repair" as const;

    constructor(
        public readonly system: SabotagableSystem<RoomType>,
        public readonly message: BaseSystemMessage|BaseDataMessage|null,
        public readonly player: Player<RoomType>|null,
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
