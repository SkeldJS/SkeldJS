import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRpcMessage } from "./BaseRpcMessage";

export class UnknownRpcMessage extends BaseRpcMessage {
    constructor(public readonly messageTag: number, public readonly dataReader: HazelReader) {
        super(messageTag);
    }

    static deserializeFromReader(reader: HazelReader): UnknownRpcMessage {
        throw new Error("Method not implemented.");
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.bytes(this.dataReader);
    }

    clone() {
        return new UnknownRpcMessage(this.messageTag, HazelReader.from(this.dataReader));
    }
}