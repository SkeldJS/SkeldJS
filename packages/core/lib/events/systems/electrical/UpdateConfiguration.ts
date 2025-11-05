import { BasicEvent } from "@skeldjs/events";
import { ElectricalDoorsSystemDataMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../../StatefulRoom";
import { RoomEvent } from "../../RoomEvent";
import { ElectricalDoorsSystem } from "../../../systems";
import { ElectricalDoorsSystemEvent } from "./ElectricalDoorsSystemEvent";

export class ElectricalDoorsSystemUpdateConfigurationEvent<RoomType extends StatefulRoom> extends BasicEvent implements RoomEvent<RoomType>, ElectricalDoorsSystemEvent<RoomType> {
    static eventName = "systems.electricaldoors.updateconfiguration" as const;
    eventName = "systems.electricaldoors.updateconfiguration" as const;

    constructor(
        public readonly system: ElectricalDoorsSystem<RoomType>,
        public readonly originMessage: ElectricalDoorsSystemDataMessage|null,
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
