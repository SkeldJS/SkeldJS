import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";

export class KickPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.KickPlayer;

    constructor(
        public readonly gameId: number,
        public readonly clientId: number,
        public readonly banned: boolean,
        public readonly reason?: DisconnectReason
    ) {
        super(KickPlayerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.packed();
        const banned = reader.bool();
        const reason = reader.left ? reader.uint8() : undefined;

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
