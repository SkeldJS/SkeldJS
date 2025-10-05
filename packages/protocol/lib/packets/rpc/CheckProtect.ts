import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class CheckProtectMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.CheckProtect as const;
    messageTag = RpcMessageTag.CheckProtect as const;

    targetNetId: number;

    constructor(victimNetId: number) {
        super();

        this.targetNetId = victimNetId;
    }

    static deserializeFromReader(reader: HazelReader) {
        const victimNetId = reader.upacked();

        return new CheckProtectMessage(victimNetId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.targetNetId);
    }

    clone() {
        return new CheckProtectMessage(this.targetNetId);
    }
}
