import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetStartCounterMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetStartCounter;

    constructor(public readonly sequenceId: number, public readonly counter: number) {
        super(SetStartCounterMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const sequenceid = reader.upacked();
        const counter = reader.int8();

        return new SetStartCounterMessage(sequenceid, counter);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.sequenceId);
        writer.int8(this.counter);
    }

    clone() {
        return new SetStartCounterMessage(this.sequenceId, this.counter);
    }
}
