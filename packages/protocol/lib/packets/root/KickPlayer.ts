import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class KickPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.KickPlayer as const;
    messageTag = RootMessageTag.KickPlayer as const;

    readonly gameId: number;
    readonly clientId: number;
    readonly banned: boolean;
    readonly reason: DisconnectReason;

    constructor(
        gameId: number,
        clientId: number,
        banned: boolean,
        reason?: DisconnectReason
    ) {
        super();

        this.gameId = gameId;

        this.clientId = clientId;
        this.banned = banned;
        this.reason = reason || DisconnectReason.Error;
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.packed();
        const banned = reader.bool();
        const reason = reader.left ? reader.uint8() : DisconnectReason.Error;

        return new KickPlayerMessage(code, clientId, banned, reason);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.packed(this.clientId);
        writer.bool(this.banned);

        if (typeof this.reason === "number") {
            writer.uint8(this.reason);
        }
    }

    clone() {
        return new KickPlayerMessage(this.gameId, this.clientId, this.banned, this.reason);
    }
}
