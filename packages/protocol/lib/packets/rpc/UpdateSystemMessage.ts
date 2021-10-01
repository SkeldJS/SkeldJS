import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { BaseSystemMessage } from "../system";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class UpdateSystemMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.UpdateSystem as const;
    messageTag = RpcMessageTag.UpdateSystem as const;

    constructor(
        public readonly playerNetid: number,
        public readonly data: BaseSystemMessage
    ) {
        super();
    }

    get children() {
        return [ this.data ];
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const systemType = reader.uint8();
        const netid = reader.upacked();
        const rpcMessageClass = decoder.types.get(`system:${systemType}`);
        const mreader = reader.bytes(reader.left);

        if (!rpcMessageClass)
            return new UpdateSystemMessage(netid, new BaseSystemMessage);

        const rpc = rpcMessageClass.Deserialize(mreader, direction, decoder);

        return new UpdateSystemMessage(netid, rpc as BaseSystemMessage);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.uint8(this.data.messageTag);
        writer.upacked(this.playerNetid);
        writer.write(this.data, direction, decoder);
    }

    clone() {
        return new UpdateSystemMessage(this.playerNetid, this.data.clone());
    }
}
