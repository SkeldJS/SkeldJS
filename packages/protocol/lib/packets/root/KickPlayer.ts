import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { GameCode, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class KickPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.KickPlayer as const;
    messageTag = RootMessageTag.KickPlayer as const;

    readonly code: number;
    readonly clientId: number;
    readonly banned: boolean;
    readonly reason: DisconnectReason;

    constructor(
        code: string | number,
        clientId: number,
        banned: boolean,
        reason?: DisconnectReason
    ) {
        super();

        if (typeof code === "string") {
            this.code = GameCode.convertStringToInt(code);
        } else {
            this.code = code;
        }

        this.clientId = clientId;
        this.banned = banned;
        this.reason = reason || DisconnectReason.Error;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.packed();
        const banned = reader.bool();
        const reason = reader.left ? reader.uint8() : DisconnectReason.Error;

        return new KickPlayerMessage(code, clientId, banned, reason);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.packed(this.clientId);
        writer.bool(this.banned);

        if (typeof this.reason === "number") {
            writer.uint8(this.reason);
        }
    }

    clone() {
        return new KickPlayerMessage(this.code, this.clientId, this.banned, this.reason);
    }
}
