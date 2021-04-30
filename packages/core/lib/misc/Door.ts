import { HazelReader, HazelWriter } from "@skeldjs/util";
import {
    EventEmitter,
    ExtractEventTypes,
} from "@skeldjs/events";

import { SystemStatus } from "../system";
import { DoorCloseDoorEvent, DoorOpenDoorEvent } from "../events";

export type DoorEvents = ExtractEventTypes<[
    DoorOpenDoorEvent,
    DoorCloseDoorEvent
]>;

/**
 * Represents a manual door for the {@link DoorsSystem} or {@link ElectricalDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class Door extends EventEmitter<DoorEvents> {
    private _isOpen: boolean;

    constructor(
        protected system: SystemStatus,
        readonly id: number,
        isOpen: boolean
    ) {
        super();

        this._isOpen = isOpen;
    }

    async emit<Event extends DoorEvents[keyof DoorEvents]>(
        event: Event
    ): Promise<Event> {
        if (this.system) {
            this.system.emit(event);
        }

        return super.emit(event);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Deserialize(reader: HazelReader, spawn: boolean) {
        this.isOpen = reader.bool(); // Use setter to emit events.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Serialize(writer: HazelWriter, spawn: boolean) {
        writer.bool(this._isOpen);
    }

    /**
     * Whether or not this door is currently open.
     */
    get isOpen() {
        return this._isOpen;
    }

    set isOpen(isOpen: boolean) {
        if (isOpen) this.open();
        else this.close();
    }

    /**
     * Force the door open.
     */
    open() {
        if (this._isOpen) return;

        this._isOpen = true;
        this.emit(new DoorOpenDoorEvent(this.system?.ship?.room, this));
    }

    /**
     * Force the door to close.
     */
    close() {
        if (!this._isOpen) return;

        this._isOpen = false;
        this.emit(new DoorCloseDoorEvent(this.system?.ship?.room, this));
    }
}
