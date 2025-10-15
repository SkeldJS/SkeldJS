import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { PlatformSpecificData } from "../../misc";

import { BaseRootMessage } from "./BaseRootMessage";

export class S2CJoinGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinGame;

    constructor(
        public readonly gameId: number,
        public readonly clientId: number,
        public readonly hostId: number,
        public readonly playerName: string,
        public readonly platform: PlatformSpecificData,
        public readonly playerLevel: number,
        public readonly puid: string,
        public readonly friendCode: string
    ) {
        super(S2CJoinGameMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();

        const clientId = reader.int32();
        const hostId = reader.int32();
        const playerName = reader.string();
        const platform = reader.read(PlatformSpecificData);
        const playerLevel = reader.upacked();
        const puid = reader.string();
        const friendCode = reader.string();

        return new S2CJoinGameMessage(code, clientId, hostId, playerName, platform, playerLevel, puid, friendCode);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.int32(this.clientId);
        writer.int32(this.hostId);
        writer.string(this.playerName);
        writer.write(this.platform);
        writer.upacked(this.playerLevel);
        writer.string(this.puid);
        writer.string(this.friendCode);
    }

    clone() {
        return new S2CJoinGameMessage(
            this.gameId,
            this.clientId,
            this.hostId,
            this.playerName,
            new PlatformSpecificData(
                this.platform.platformTag,
                this.platform.platformName,
                this.platform.platformId
            ),
            this.playerLevel,
            this.puid,
            this.friendCode
        );
    }
}

export class C2SJoinGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinGame;

    constructor(public readonly gameId: number, public readonly crossPlay: boolean) {
        super(C2SJoinGameMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const crossPlayBlocked = reader.bool();

        return new C2SJoinGameMessage(code, !crossPlayBlocked);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.bool(!this.crossPlay);
    }

    clone() {
        return new C2SJoinGameMessage(this.gameId, this.crossPlay);
    }
}