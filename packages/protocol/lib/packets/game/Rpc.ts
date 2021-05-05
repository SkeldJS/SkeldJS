import { GameDataMessageTag, RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { BaseRpcMessage } from "../rpc/BaseRpcMessage";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class RpcMessage extends BaseGameDataMessage {
    static tag = GameDataMessageTag.RPC as const;
    tag = GameDataMessageTag.RPC as const;

    readonly netid: number;
    readonly callid: RpcMessageTag;
    readonly data: BaseRpcMessage;

    constructor(netid: number, callid: number, data: BaseRpcMessage) {
        super();

        this.netid = netid;
        this.callid = callid;
        this.data = data;
    }

    get children() {
        return [this.data];
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
            return new RpcMessage(netid, callid, new BaseRpcMessage());

        const mreader = reader.bytes(reader.left);
        const rpcMessageClass = rpcMessages.get(callid);

        if (!rpcMessageClass)
            return new RpcMessage(netid, callid, new BaseRpcMessage());

        const rpc = rpcMessageClass.Deserialize(mreader, direction, decoder);

        return new RpcMessage(netid, callid, rpc as BaseRpcMessage);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.upacked(this.netid);
        writer.uint8(this.callid);
        writer.write(this.data, direction, decoder);
    }
}
