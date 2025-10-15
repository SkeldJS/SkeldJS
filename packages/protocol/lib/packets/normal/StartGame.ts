import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

export class StartGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.StartGame;

    constructor(public readonly gameId: number) {
        super(StartGameMessage.messageTag);
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
