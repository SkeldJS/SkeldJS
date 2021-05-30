import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { Hostable } from "../../Hostable";
import { Door } from "../../misc/Door";
import { AutoDoorsSystem, DoorsSystem, ElectricalDoorsSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerData } from "../../PlayerData";
import { DoorsEvent } from "./DoorsEvent";

export class DoorsDoorCloseEvent extends RevertableEvent implements RoomEvent, DoorsEvent, ProtocolEvent {
    static eventName = "doors.close" as const;
    eventName = "doors.close" as const;

    private _alteredDoor: Door;

    constructor(
        public readonly room: Hostable,
        public readonly doorsystem: AutoDoorsSystem|DoorsSystem|ElectricalDoorsSystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player: PlayerData|undefined,
        public readonly door: Door
    ) {
        super();

        this._alteredDoor = door;
    }

    get alteredDoor() {
        return this._alteredDoor;
    }

    setDoor(door: Door|number): void {
        if (typeof door === "number") {
            return this.setDoor(this.doorsystem.doors[door]);
        }

        this._alteredDoor === door;
    }
}
