import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class DataMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Data;

    constructor(public readonly netId: number, public readonly data: Buffer) {
        super(DataMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const netId = reader.upacked();
        const data = reader.bytes(reader.left);
        return new DataMessage(netId, data.buffer);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.netId);
        writer.bytes(this.data);
    }

    clone() {
        return new DataMessage(this.netId, Buffer.from(this.data));
    }
}
