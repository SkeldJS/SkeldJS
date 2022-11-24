import { BaseRpcMessage, MessageDirection, PacketDecoder } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseReactorRpcMessage } from "./BaseReactorRpcMessage";

export class UnknownReactorRpc extends BaseReactorRpcMessage {
    static messageTag = 255 as const;

    constructor(
        public readonly messageTag: number,
        public readonly data: Buffer
    ) {
        super();
    }

    Serialize(writer: HazelWriter) {
        writer.bytes(this.data);
    }
}

export class ModIdentifier {
    constructor(public readonly netId?: number, public readonly modId?: string) {}

    getIdentifier() {
        return (this.netId || this.modId)!;
    }

    static Deserialize(reader: HazelReader) {
        const netId = reader.upacked();

        if (netId > 0) {
            return new ModIdentifier(netId);
        }

        const modId = reader.string();
        return new ModIdentifier(undefined, modId);
    }

    Serialize(writer: HazelWriter) {
        const identifier = this.getIdentifier();
        if (typeof identifier === "string") {
            writer.upacked(0);
            writer.string(identifier);
        } else {
            writer.upacked(identifier);
        }
    }
}

export class Rpc255Reactor extends BaseRpcMessage {
    static messageTag = 0xff as const;
    messageTag = 0xff as const;

    constructor(public readonly modId: ModIdentifier, public readonly data: BaseReactorRpcMessage) {
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
        const modId = reader.read(ModIdentifier);
        const callId = reader.uint8();

        const [ , mReader ] = reader.message();
        const rpcMessageClass = decoder.types.get(`reactor-rpc:${callId}`);

        if (!rpcMessageClass)
            return new Rpc255Reactor(modId, new UnknownReactorRpc(callId, mReader.buffer));

        const rpc = rpcMessageClass.Deserialize(mReader, direction, decoder);

        return new Rpc255Reactor(modId, rpc as BaseReactorRpcMessage);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.write(this.modId);
        writer.uint8(this.data.messageTag);
        writer.write(this.data, direction, decoder);
    }
}
