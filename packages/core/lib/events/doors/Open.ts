import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { Hostable } from "../../Hostable";
import { Door } from "../../misc/Door";
import { AutoDoorsSystem, DoorsSystem, ElectricalDoorsSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerData } from "../../PlayerData";
import { DoorsEvent } from "./DoorsEvent";

/**
 * Emitted when a door is opened either by a player opening it manually, i.e.
 * the doors on Polus, or opened automatically after some time, i.e. the doors
 * on The Skeld.
 */
export class DoorsDoorOpenEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, DoorsEvent, ProtocolEvent {
    static eventName = "doors.open" as const;
    eventName = "doors.open" as const;

    private _alteredDoor: Door<RoomType>;

    constructor(
        public readonly room: RoomType,
        public readonly doorsystem: AutoDoorsSystem<RoomType>|DoorsSystem<RoomType>|ElectricalDoorsSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player that opened the door. Only available if the client is the
         * host.
         */
        public readonly player: PlayerData<RoomType>|undefined,
        /**
         * The door that the player opened.
         */
        public readonly door: Door<RoomType>
    ) {
        super();

        this._alteredDoor = door;
    }

    /**
     * The alternate door that will be opened, if changed.
     */
    get alteredDoor() {
        return this._alteredDoor;
    }

    /**
     * Change the door that was opened.
     * @param door The door to open.
     */
    setDoor(door: Door<RoomType>|number): void {
        if (typeof door === "number") {
            return this.setDoor(this.doorsystem.doors[door]);
        }

        this._alteredDoor = door;
    }
}
