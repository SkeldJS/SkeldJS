import { GameOverReason, RootMessageTag } from "@skeldjs/constant";
import { GameCode, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class EndGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.EndGame as const;
    messageTag = RootMessageTag.EndGame as const;

    readonly code: number;
    readonly reason: GameOverReason;
    readonly showAd: boolean;

    constructor(
        code: string | number,
        reason: GameOverReason,
        showAd: boolean
    ) {
        super();

        if (typeof code === "string") {
            this.code = GameCode.convertStringToInt(code);
        } else {
            this.code = code;
        }

        this.reason = reason;
        this.showAd = showAd;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const reason = reader.uint8();
        const show_ad = reader.bool();

        return new EndGameMessage(code, reason, show_ad);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.uint8(this.reason);
        writer.bool(this.showAd);
    }

    clone() {
        return new EndGameMessage(this.code, this.reason, this.showAd);
    }
}
