import { GameOverReason, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class EndGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.EndGame as const;
    messageTag = RootMessageTag.EndGame as const;

    readonly code: number;
    readonly reason: GameOverReason;
    readonly show_ad: boolean;

    constructor(
        code: string | number,
        reason: GameOverReason,
        show_ad: boolean
    ) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.reason = reason;
        this.show_ad = show_ad;
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
        writer.bool(this.show_ad);
    }
}
