import { AlterGameTag, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class AlterGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.AlterGame as const;
    messageTag = RootMessageTag.AlterGame as const;

    readonly code: number;
    readonly alterTag: AlterGameTag;
    readonly value: number;

    constructor(code: string | number, alterTag: AlterGameTag, value: number) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.alterTag = alterTag;
        this.value = value;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const alterTag = reader.uint8();
        const value = reader.uint8();

        return new AlterGameMessage(code, alterTag, value);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.uint8(this.alterTag);
        writer.uint8(this.value);
    }

    clone() {
        return new AlterGameMessage(this.code, this.alterTag, this.value);
    }
}
