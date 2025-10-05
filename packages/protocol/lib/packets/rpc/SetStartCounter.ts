import { RpcMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class SetStartCounterMessage extends BaseRpcMessage {
    static messageTag = RpcMessageTag.SetStartCounter as const;
    messageTag = RpcMessageTag.SetStartCounter as const;

    sequenceid: number;
    counter: number;

    constructor(sequenceid: number, counter: number) {
        super();

        this.sequenceid = sequenceid;
        this.counter = counter;
    }

    static deserializeFromReader(reader: HazelReader) {
        const sequenceid = reader.upacked();
        const counter = reader.int8();

        return new SetStartCounterMessage(sequenceid, counter);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(this.sequenceid);
        writer.int8(this.counter);
    }

    clone() {
        return new SetStartCounterMessage(this.sequenceid, this.counter);
    }
}
