import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage } from "./BaseSystemMessage";

export class UnknownSystemMessage extends BaseSystemMessage {
    constructor(public readonly messageTag: number, public readonly dataReader: HazelReader) {
        super(messageTag);
    }

    static deserializeFromReader(reader: HazelReader): UnknownSystemMessage {
        throw new Error("Method not implemented.");
    }
    
    serializeToWriter(writer: HazelWriter): void {
        writer.bytes(this.dataReader);
    }

    clone() {
        return new UnknownSystemMessage(this.messageTag, HazelReader.from(this.dataReader));
    }
}