import { AlterGameTag, RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

export class AlterGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.AlterGame;

    constructor(public readonly gameId: number, public readonly alterTag: AlterGameTag, public readonly value: number) {
        super(AlterGameMessage.messageTag);
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
