import { AlterGameTag, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class AlterGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.AlterGame as const;
    messageTag = RootMessageTag.AlterGame as const;

    readonly gameId: number;
    readonly alterTag: AlterGameTag;
    readonly value: number;

    constructor(gameId: number, alterTag: AlterGameTag, value: number) {
        super();

        this.gameId = gameId;

        this.alterTag = alterTag;
        this.value = value;
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const alterTag = reader.uint8();
        const value = reader.uint8();

        return new AlterGameMessage(code, alterTag, value);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.uint8(this.alterTag);
        writer.uint8(this.value);
    }

    clone() {
        return new AlterGameMessage(this.gameId, this.alterTag, this.value);
    }
}
