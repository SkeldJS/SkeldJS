import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export enum MedScanUpdate {
    AddPlayer = 0x80,
    RemovePlayer = 0x40,
}

export class MedScanSystemMessage extends BaseSystemMessage {
    constructor(
        public readonly action: MedScanUpdate,
        public readonly playerId: number,
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const byte = reader.uint8();
        const playerId = byte & 0x31;
        if (byte & MedScanUpdate.AddPlayer) {
            return new MedScanSystemMessage(MedScanUpdate.AddPlayer, playerId);
        } else if (byte & MedScanUpdate.RemovePlayer) {
            return new MedScanSystemMessage(MedScanUpdate.RemovePlayer, playerId);
        }
            return new MedScanSystemMessage(MedScanUpdate.AddPlayer, 0); // TODO: throw exception
    }

    serializeToWriter(writer: HazelWriter) {
        const byte = this.action | this.playerId;
        writer.uint8(byte);
    }

    clone() {
        return new MedScanSystemMessage(this.action, this.playerId);
    }
}
