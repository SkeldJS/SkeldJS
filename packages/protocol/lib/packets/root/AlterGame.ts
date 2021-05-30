import { AlterGameTag, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class AlterGameMessage extends BaseRootMessage {
    static tag = RootMessageTag.AlterGame as const;
    tag = RootMessageTag.AlterGame as const;

    readonly code: number;
    readonly alterTag: AlterGameTag;
    readonly value: number;

    constructor(code: string | number, alter_tag: AlterGameTag, value: number) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.alterTag = alter_tag;
        this.value = value;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const alter_tag = reader.uint8();
        const value = reader.uint8();

        return new AlterGameMessage(code, alter_tag, value);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.uint8(this.alterTag);
        writer.uint8(this.value);
    }
}
