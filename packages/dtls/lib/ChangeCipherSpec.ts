import { HazelReader, HazelWriter } from "@skeldjs/util";

export class ChangeCipherSpec {
    constructor(
        public readonly changeSpec: boolean
    ) {}

    static deserializeFromReader(reader: HazelReader) {
        const changeSpec = reader.bool();
        if (!changeSpec) {
            throw new Error("Invalid change cipher spec value: " + changeSpec);
        }

        return new ChangeCipherSpec(changeSpec);
    }

    static serializeToWriter(writer: HazelWriter) {
        writer.bool(true);
    }
}
