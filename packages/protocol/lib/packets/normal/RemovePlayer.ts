import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";

export class S2CRemovePlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.RemovePlayer;

    constructor(
        public readonly gameId: number,
        public readonly clientId: number,
        public readonly reason: DisconnectReason,
        public readonly hostId: number
    ) {
        super(S2CRemovePlayerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.int32();
        const hostId = reader.int32();
        const reason = reader.uint8();

        return new S2CRemovePlayerMessage(code, clientId, reason, hostId);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.int32(this.clientId);
        writer.int32(this.hostId);
        writer.uint8(this.reason);
    }

    clone() {
        return new S2CRemovePlayerMessage(this.gameId, this.clientId, this.reason, this.hostId);
    }
}

export class C2SRemovePlayerMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.RemovePlayer;

    constructor(
        public readonly gameId: number,
        public readonly clientId: number,
        public readonly reason: DisconnectReason,
    ) {
        super(C2SRemovePlayerMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.packed();
        const reason = reader.uint8();

        return new C2SRemovePlayerMessage(code, clientId, reason);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.packed(this.clientId);
        writer.uint8(this.reason);
    }

    clone() {
        return new C2SRemovePlayerMessage(this.gameId, this.clientId, this.reason);
    }
}