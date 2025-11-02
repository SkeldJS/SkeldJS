import { RpcMessageTag, SystemType } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage, UnknownSystemMessage } from "../system";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class UpdateSystemMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.UpdateSystem;

    constructor(
        public readonly systemType: SystemType,
        public readonly playerControlNetId: number,
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

        return new UpdateSystemMessage(systemType, netId, new UnknownSystemMessage(dataReader));
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint8(this.systemType);
        writer.upacked(this.playerControlNetId);
        writer.write(this.data);
    }

    clone() {
        return new UpdateSystemMessage(this.systemType, this.playerControlNetId, this.data.clone());
    }
}
