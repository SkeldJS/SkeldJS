import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class DoorStateDataMessage extends BaseDataMessage {
    constructor(public readonly doorId: number, public readonly isOpen: boolean) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): AutoDoorsSystemSpawnDataMessage {
        throw new Error("Method not implemented.");
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.bool(this.isOpen);
    }

    clone(): DoorStateDataMessage {
        return new DoorStateDataMessage(this.doorId, this.isOpen);
    }
}

export class AutoDoorsSystemSpawnDataMessage extends BaseDataMessage {
    constructor(public readonly doorStates: DoorStateDataMessage[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): AutoDoorsSystemSpawnDataMessage {
        const message = new AutoDoorsSystemSpawnDataMessage([]);
        var i = 0;
        while (reader.left > 0) {
            const isOpen = reader.bool();
            message.doorStates.push(new DoorStateDataMessage(i, isOpen));
            i += 1;
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        for (const doorState of this.doorStates) writer.write(doorState);
    }

    clone(): AutoDoorsSystemSpawnDataMessage {
        return new AutoDoorsSystemSpawnDataMessage([...this.doorStates]);
    }
}

export class AutoDoorsSystemDataMessage extends BaseDataMessage {
    constructor(public readonly doorStates: DoorStateDataMessage[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): AutoDoorsSystemDataMessage {
        const message = new AutoDoorsSystemDataMessage([]);
        const mask = reader.upacked();
        for (let i = 0; i < 32; i++) { // 32 for integer size, also probably maximum amount of doors
            if (mask & (1 << i)) {
                const isOpen = reader.bool();
                message.doorStates.push(new DoorStateDataMessage(i, isOpen));
            }
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        var mask: number = 0;
        for (const doorState of this.doorStates) {
            mask |= (1 << doorState.doorId);
        }
        writer.upacked(mask);
        for (const doorState of this.doorStates) writer.write(doorState);
    }

    clone(): AutoDoorsSystemDataMessage {
        return new AutoDoorsSystemDataMessage([...this.doorStates]);
    }
}