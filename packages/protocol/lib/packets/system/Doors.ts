import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum DoorUpdate {
    Open = 0x64,
}

export class DoorsSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly update: DoorUpdate,
        public readonly doorId: number,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const b = reader.uint8();
        const id = b & 31;
        if (b & 64) {
            return new DoorsSystemMessage(DoorUpdate.Open, id);
        }
        // TODO: throw exception?
        return new DoorsSystemMessage(DoorUpdate.Open, id);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.update & this.doorId);
    }

    clone() {
        return new DoorsSystemMessage(this.update, this.doorId);
    }
}
