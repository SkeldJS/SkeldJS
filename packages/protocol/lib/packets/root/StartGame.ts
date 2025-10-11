import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class StartGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.StartGame as const;
    messageTag = RootMessageTag.StartGame as const;

    readonly gameId: number;

    constructor(gameId: number) {
        super();

        this.gameId = gameId;
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();

        return new StartGameMessage(code);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
    }

    clone() {
        return new StartGameMessage(this.gameId);
    }
}
