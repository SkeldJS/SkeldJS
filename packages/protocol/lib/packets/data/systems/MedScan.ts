import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseDataMessage } from "../BaseDataMessage";

export class MedScanSystemDataMessage extends BaseDataMessage {
    constructor(public readonly playerIdQueue: number[]) {
        super();
    }

    static deserializeFromReader(reader: HazelReader): MedScanSystemDataMessage {
        const message = new MedScanSystemDataMessage([]);
        const numPlayerIds = reader.upacked();
        for (let i = 0; i < numPlayerIds; i++) { // 32 for integer size, also probably maximum amount of doors
            message.playerIdQueue.push(reader.uint8());
        }
        return message;
    }

    serializeToWriter(writer: HazelWriter): void {
        writer.upacked(this.playerIdQueue.length);
        for (const playerId of this.playerIdQueue) writer.uint8(playerId);
    }

    clone(): MedScanSystemDataMessage {
        return new MedScanSystemDataMessage([...this.playerIdQueue]);
    }
}