import { RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class StartGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.StartGame as const;
    messageTag = RootMessageTag.StartGame as const;

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
        const code = reader.int32();

        return new StartGameMessage(code);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
    }

    clone() {
        return new StartGameMessage(this.code);
    }
}
