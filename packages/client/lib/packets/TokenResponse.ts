import { BaseRootMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";

export class TokenResponseMessage extends BaseRootMessage {
    static messageTag = 1 as const;
    messageTag = 1 as const;

    constructor(
        public readonly token: number
    ) {
        super();
    }

    static deserializeFromReader(reader: HazelReader) {
        const token = reader.uint32();
        return new TokenResponseMessage(token);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.uint32(this.token);
    }
}
