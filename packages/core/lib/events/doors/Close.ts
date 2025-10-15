import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { AutoDoorsSystem, Door, DoorsSystem, ElectricalDoorsSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { Player } from "../../Player";
import { DoorsEvent } from "./DoorsEvent";

/**
 * Emitted when a player closes a specific door.
 */
export class DoorsDoorCloseEvent<RoomType extends StatefulRoom> extends RevertableEvent implements DoorsEvent<RoomType>, ProtocolEvent {
    static eventName = "doors.close" as const;
    eventName = "doors.close" as const;

    private _alteredDoor: Door<RoomType>;

    constructor(
        public readonly room: RoomType,
        public readonly doorsystem: AutoDoorsSystem<RoomType> | DoorsSystem<RoomType> | ElectricalDoorsSystem<RoomType>,
        public readonly message: RepairSystemMessage | undefined,
        /**
         * The player that closed the door. Only available if the client is the
         * host.
         */
        public readonly player: Player<RoomType> | undefined,
        /**
         * The door that the player closed.
         */
        public readonly door: Door<RoomType>
    ) {
        super();

        this._alteredDoor = door;
    }

    /**
     * The alternate door that will be closed, if changed.
     */
    get alteredDoor() {
        return this._alteredDoor;
    }

    /**
     * Change the door that was closed.
     * @param door The door to close.
     */
    setDoor(door: Door<RoomType> | number): void {
        if (typeof door === "number") {
            return this.setDoor(this.doorsystem.doors[door]);
        }

        this._alteredDoor = door;
    }
}
