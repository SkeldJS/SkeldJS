import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { BaseRpcMessage } from "../rpc/BaseRpcMessage";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class RpcMessage extends BaseGameDataMessage {
    static tag = GameDataMessageTag.RPC as const;
    tag = GameDataMessageTag.RPC as const;

    readonly netid: number;
    readonly data: BaseRpcMessage;

    constructor(netid: number, data: BaseRpcMessage) {
        super();

        this.netid = netid;
        this.data = data;
    }

    get canceled() {
        return this.data.canceled;
    }

    cancel() {
        this.data.cancel();
    }

    get children() {
        return [ this.data ];
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const netid = reader.upacked();
        const callid = reader.uint8();

        const rpcMessages = decoder.types.get("rpc");

        if (!rpcMessages)
            return new RpcMessage(netid, new BaseRpcMessage);

        const mreader = reader.bytes(reader.left);
        const rpcMessageClass = rpcMessages.get(callid);

        if (!rpcMessageClass)
            return new RpcMessage(netid, new BaseRpcMessage);

        const rpc = rpcMessageClass.Deserialize(mreader, direction, decoder);

        return new RpcMessage(netid, rpc as BaseRpcMessage);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.upacked(this.netid);
        writer.uint8(this.data.tag);
        writer.write(this.data, direction, decoder);
    }
}
