import { RevertableEvent } from "@skeldjs/events";
import { SwitchSystemDataMessage, SwitchSystemMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../../StatefulRoom";
import { RoomEvent } from "../../RoomEvent";
import { SwitchSystem } from "../../../systems";
import { SwitchSystemEvent } from "./SwitchSystemEvent";
import { Player } from "../../../Player";

export class SwitchSystemFlipEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType>, SwitchSystemEvent<RoomType> {
    static eventName = "systems.switch.flip" as const;
    eventName = "systems.switch.flip" as const;

    constructor(
        public readonly system: SwitchSystem<RoomType>,
        public readonly originMessage: SwitchSystemDataMessage|SwitchSystemMessage|null,
        public readonly player: Player<RoomType>|null,
        public readonly switchIdx: number,
        public readonly isActive: boolean,
        public readonly isExpected: boolean,
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
