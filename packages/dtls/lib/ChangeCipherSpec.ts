import { HazelReader, HazelWriter } from "@skeldjs/util";

export class ChangeCipherSpec {
    constructor(
        public readonly changeSpec: boolean
    ) {}

    static Deserialize(reader: HazelReader) {
        const changeSpec = reader.bool();
        if (!changeSpec) {
            throw new Error("Invalid change cipher spec value: " + changeSpec);
        }

        return new ChangeCipherSpec(changeSpec);
    }

    static Serialize(writer: HazelWriter) {
        writer.bool(true);
    }
}
