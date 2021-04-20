import { RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class StartGameMessage extends BaseRootMessage {
    static tag = RootMessageTag.StartGame as const;
    tag = RootMessageTag.StartGame as const;

    readonly code: number;

    constructor(code: string | number) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.uint32();

        return new StartGameMessage(code);
    }

    Serialize(writer: HazelWriter) {
        writer.uint32(this.code);
    }
}
