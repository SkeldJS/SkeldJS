import { GameDataMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { MessageDirection, PacketDecoder } from "../../PacketDecoder";
import { BaseRpcMessage } from "../rpc/BaseRpcMessage";
import { BaseGameDataMessage } from "./BaseGameDataMessage";

export class UnknownRpc extends BaseRpcMessage {
    static messageTag = 0 as const;

    constructor(
        public readonly messageTag: GameDataMessageTag,
        public readonly data: Buffer
    ) {
        super();
    }

    Serialize(writer: HazelWriter) {
        writer.bytes(this.data);
    }
}

export class RpcMessage extends BaseGameDataMessage {
    static messageTag = GameDataMessageTag.RPC as const;
    messageTag = GameDataMessageTag.RPC as const;

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

        const mreader = reader.bytes(reader.left);
        const rpcMessageClass = decoder.types.get(`rpc:${callid}`);

        if (!rpcMessageClass)
            return new RpcMessage(netid, new UnknownRpc(callid, mreader.buffer));

        const rpc = rpcMessageClass.Deserialize(mreader, direction, decoder);

        return new RpcMessage(netid, rpc as BaseRpcMessage);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.upacked(this.netid);
        writer.uint8(this.data.messageTag);
        writer.write(this.data, direction, decoder);
    }

    clone() {
        return new RpcMessage(this.netid, this.data.clone());
    }
}
