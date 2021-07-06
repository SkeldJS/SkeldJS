import { BaseRootMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";

export class TokenResponseMessage extends BaseRootMessage {
    static tag = 1 as const;
    tag = 1 as const;

    constructor(
        public readonly token: number
    ) {
        super();
    }

    static Deserialize(reader: HazelReader) {
        const token = reader.uint32();
        return new TokenResponseMessage(token);
    }

    Serialize(writer: HazelWriter) {
        writer.uint32(this.token);
    }
}
