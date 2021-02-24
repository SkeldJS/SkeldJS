import { HazelBuffer } from "@skeldjs/util";
import Emittery from "emittery";

import { SystemStatus } from "../system";

export type DoorEvents = {
        "doors.open": {};
        "doors.close": {};
}

export class Door extends Emittery<DoorEvents> {
    private _isOpen: boolean;

    constructor(protected system: SystemStatus, readonly id: number, isOpen: boolean) {
        super();

        this._isOpen = isOpen;
    }

    async emit(...args: any) {
        const event = args[0];
        const data = args[1];

        this.system.emit(event, {
            ...data,
            door: this
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

    get isOpen() {
        return this._isOpen;
    }

    set isOpen(isOpen: boolean) {
        if (isOpen)
            this.open();
        else
            this.close();
    }

    open() {
        if (this._isOpen)
            return;

        this._isOpen = true;
        this.emit("doors.open", {});
    }

    close() {
        if (!this._isOpen)
            return;

        this._isOpen = false;
        this.emit("doors.close", {});
    }
}
