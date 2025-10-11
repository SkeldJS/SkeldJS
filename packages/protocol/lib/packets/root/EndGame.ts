import { GameOverReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class EndGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.EndGame as const;
    messageTag = RootMessageTag.EndGame as const;

    readonly gameId: number;
    readonly reason: GameOverReason;
    readonly showAd: boolean;

    constructor(
        gameId: number,
        reason: GameOverReason,
        showAd: boolean
    ) {
        super();

        this.gameId = gameId;

        this.reason = reason;
        this.showAd = showAd;
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
