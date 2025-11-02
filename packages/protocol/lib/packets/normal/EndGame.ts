import { GameOverReason, RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

export class EndGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.EndGame;

    constructor(
        public readonly gameId: number,
        public readonly reason: GameOverReason,
        public readonly showAd: boolean
    ) {
        super(EndGameMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const reason = reader.uint8();
        const show_ad = reader.bool();

        return new EndGameMessage(code, reason, show_ad);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.uint8(this.reason);
        writer.bool(this.showAd);
    }

    clone() {
        return new EndGameMessage(this.gameId, this.reason, this.showAd);
    }
}
