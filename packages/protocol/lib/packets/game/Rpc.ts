import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "../rpc/BaseRpcMessage";
import { BaseGameDataMessage } from "./BaseGameDataMessage";
import { UnknownRpcMessage } from "../rpc";

export class RpcMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.Rpc;

    constructor(
        public readonly netId: number,
        public readonly child: BaseRpcMessage
    ) {
        super(RpcMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader,) {
        const netId = reader.upacked();
        const callId = reader.uint8();
        const dataReader = reader.bytes(reader.left);
        return new RpcMessage(netId, new UnknownRpcMessage(callId, dataReader));
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.netId);
        writer.uint8(this.child.messageTag);
        writer.write(this.child);
    }

    clone() {
        return new RpcMessage(this.netId, this.child.clone());
    }
}
