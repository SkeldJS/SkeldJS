import { GameDataMessageTag, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class RpcMessage extends BaseGameDataMessage {
    static tag = GameDataMessageTag.RPC as const;
    tag = GameDataMessageTag.RPC as const;

    readonly netid: number;
    readonly callid: RpcMessageTag;
    readonly data: Buffer;

    constructor(netid: number, callid: number, data: Buffer) {
        super();

        this.netid = netid;
        this.callid = callid;
        this.data = data;
    }

    static Deserialize(reader: HazelReader) {
        const netid = reader.upacked();
        const callid = reader.uint8();
        const data = reader.bytes(reader.left);

        return new RpcMessage(netid, callid, data.buffer);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.netid);
        writer.uint8(this.callid);
        writer.bytes(this.data);
    }
}
