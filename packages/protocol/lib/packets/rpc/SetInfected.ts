import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetInfectedMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetInfected;

    constructor(public readonly impostors: number[]) {
        super(SetInfectedMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const impostors = reader.list((r) => r.uint8());

        return new SetInfectedMessage(impostors);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.list(true, this.impostors, (i) => writer.uint8(i));
    }

    clone() {
        return new SetInfectedMessage([...this.impostors]);
    }
}
