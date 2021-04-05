import { HazelBuffer } from "@skeldjs/util";
import { EventEmitter } from "@skeldjs/events";

import { SystemStatus } from "../system";

export interface DoorEvents {
    /**
     * Emitted when the door opens.
     */
    "doors.open": {};
    /**
     * Emitted when the door closes.
     */
    "doors.close": {};
}

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

    async emit(...args: any) {
        const event = args[0];
        const data = args[1];

        this.system.emit(event, {
            ...data,
            door: this,
        });

        return super.emit(event, data);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        this.isOpen = reader.bool(); // Use setter to emit events.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Serialize(writer: HazelBuffer, spawn: boolean) {
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
        this.emit("doors.open", {});
    }

    /**
     * Force the door to close.
     */
    close() {
        if (!this._isOpen) return;

        this._isOpen = false;
        this.emit("doors.close", {});
    }
}
