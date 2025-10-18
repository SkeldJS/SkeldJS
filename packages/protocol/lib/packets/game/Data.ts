import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseGameDataMessage } from "./BaseGameDataMessage";
import { BaseDataMessage, UnknownDataMessage } from "../data";

export class DataMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Data;

    constructor(public readonly netId: number, public readonly data: BaseDataMessage) {
        super(DataMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const netId = reader.upacked();
        const data = UnknownDataMessage.deserializeFromReader(reader);
        return new DataMessage(netId, data);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.netId);
        writer.write(this.data);
    }

    clone() {
        return new DataMessage(this.netId, this.data.clone());
    }
}
