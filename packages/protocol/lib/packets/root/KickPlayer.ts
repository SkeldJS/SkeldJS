import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class KickPlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.KickPlayer as const;
    messageTag = RootMessageTag.KickPlayer as const;

    readonly code: number;
    readonly clientid: number;
    readonly banned: boolean;
    readonly reason: DisconnectReason;

    constructor(
        code: string | number,
        clientid: number,
        banned: boolean,
        reason?: DisconnectReason
    ) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.clientid = clientid;
        this.banned = banned;
        this.reason = reason || DisconnectReason.None;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const clientid = reader.packed();
        const banned = reader.bool();
        const reason = reader.left ? reader.uint8() : DisconnectReason.None;

        return new KickPlayerMessage(code, clientid, banned, reason);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.packed(this.clientid);
        writer.bool(this.banned);

        if (typeof this.reason === "number") {
            writer.uint8(this.reason);
        }
    }

    clone() {
        return new KickPlayerMessage(this.code, this.clientid, this.banned, this.reason);
    }
}
