import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { TaggedCloneable } from "../TaggedCloneable";
import { BaseDataMessage } from "./BaseDataMessage";

export abstract class TaggedDataMessage extends TaggedCloneable {
    constructor(messageTag: number, public readonly data: BaseDataMessage) {
        super(messageTag);
    }

    static deserializeFromReader(reader: HazelReader): void {
        throw new Error("Method not implemented.");
    }

    serializeToWriter(writer: HazelWriter): void {
        this.data.serializeToWriter(writer);
    }
}