import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class DataMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Data as const;
    messageTag = GameDataMessageTag.Data as const;

    readonly netId: number;
    readonly data: Buffer;

    constructor(netId: number, data: Buffer) {
        super();

        this.netId = netId;
        this.data = data;
    }

    static Deserialize(reader: HazelReader) {
        const netId = reader.upacked();
        const data = reader.bytes(reader.left);

        return new DataMessage(netId, data.buffer);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.netId);
        writer.bytes(this.data);
    }

    clone() {
        return new DataMessage(this.netId, Buffer.from(this.data));
    }
}
