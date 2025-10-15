import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage, UnknownSystemMessage } from "../system";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class UpdateSystemMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.UpdateSystem;

    constructor(
        public readonly playerNetid: number,
        public readonly data: BaseSystemMessage
    ) {
        super(UpdateSystemMessage.messageTag);
    }

    get children() {
        return [ this.data ];
    }

    static deserializeFromReader(reader: HazelReader,) {
        const systemType = reader.uint8();
        const netId = reader.upacked();
        const dataReader = reader.bytes(reader.left);

        return new UpdateSystemMessage(netId, new UnknownSystemMessage(systemType, dataReader));
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.data.messageTag);
        writer.upacked(this.playerNetid);
        writer.write(this.data);
    }

    clone() {
        return new UpdateSystemMessage(this.playerNetid, this.data.clone());
    }
}
