import { HazelReader, HazelWriter } from "@skeldjs/util";

export abstract class TaggedCloneable {
    constructor(public readonly messageTag: number) { }

    static deserializeFromReader(reader: HazelReader) {
        throw new Error("No deserialize method implemented");
    }

    abstract serializeToWriter(writer: HazelWriter): void;
    abstract clone(): TaggedCloneable;
}
