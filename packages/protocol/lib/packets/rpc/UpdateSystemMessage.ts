import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { BaseSystemMessage } from "../system";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class UpdateSystemMessage extends BaseRpcMessage {
    static tag = RpcMessageTag.UpdateSystem as const;
    tag = RpcMessageTag.UpdateSystem as const;

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
        const rpcMessages = decoder.types.get("system");

        if (!rpcMessages)
            return new UpdateSystemMessage(netid, new BaseSystemMessage);

        const mreader = reader.bytes(reader.left);
        const rpcMessageClass = rpcMessages.get(systemType);

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
        writer.uint8(this.data.tag);
        writer.write(this.data, direction, decoder);
    }
}
