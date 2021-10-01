import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class DataMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Data as const;
    messageTag = GameDataMessageTag.Data as const;

    readonly netid: number;
    readonly data: Buffer;

    constructor(netid: number, data: Buffer) {
        super();

        this.netid = netid;
        this.data = data;
    }

    static Deserialize(reader: HazelReader) {
        const netid = reader.upacked();
        const data = reader.bytes(reader.left);

        return new DataMessage(netid, data.buffer);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.netid);
        writer.bytes(this.data);
    }

    clone() {
        return new DataMessage(this.netid, Buffer.from(this.data));
    }
}
