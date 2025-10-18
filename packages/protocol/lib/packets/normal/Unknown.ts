import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseRootMessage } from "./BaseRootMessage";

export class UnknownRootMessage extends BaseRootMessage {
    constructor(public readonly messageTag: number, public readonly dataReader: HazelReader) {
        super(messageTag);
    }

    static deserializeFromReader(reader: HazelReader): UnknownRootMessage {
        throw new Error("Method not implemented.");
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.bytes(this.dataReader);
    }

    clone() {
        return new UnknownRootMessage(this.messageTag, HazelReader.from(this.dataReader));
    }
}