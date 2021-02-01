import { HazelBuffer, TypedEmitter } from "@skeldjs/util";
import { SystemStatus } from "../system";

export type DoorEvents = {
    doorOpen: () => void;
    doorClose: () => void;
}

export class Door extends TypedEmitter<DoorEvents> {
    private _isOpen: boolean;

    constructor(protected system: SystemStatus, readonly id: number, isOpen: boolean) {
        super();

        this._isOpen = isOpen;
    }

    emit(event: string, ...args: any[]) {
        this.system.emit(event, this, ...args);

        return super.emit(event, ...args);
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
        this.emit("open");
    }

    close() {
        if (!this._isOpen)
            return;

        this._isOpen = false;
        this.emit("close");
    }
}
