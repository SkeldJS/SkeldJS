import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { PlatformSpecificData } from "../../misc";

import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class JoinGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinGame as const;
    messageTag = RootMessageTag.JoinGame as const;

    readonly gameId!: number;
    readonly crossPlay: boolean;

    readonly clientId!: number;
    readonly hostId!: number;
    readonly playerName!: string;
    readonly platform!: PlatformSpecificData;
    readonly playerLevel!: number;
    readonly puid!: string;
    readonly friendCode!: string;

    readonly message!: string;

    constructor(gameId: number, crossPlay: boolean);
    constructor(
        gameId: number,
        clientId: number,
        hostId: number,
        playerName: string,
        platform: PlatformSpecificData,
        playerLevel: number,
        puid: string,
        friendCode: string
    );
    constructor(
        gameId: number,
        clientId?: number | string | boolean,
        hostId?: number,
        playerName?: string,
        platform?: PlatformSpecificData,
        playerLevel?: number,
        puid?: string,
        friendCode?: string
    ) {
        super();

        this.gameId = gameId;
        this.crossPlay = clientId as boolean;

        if (typeof hostId === "number") {
            this.clientId = clientId as number;
            this.hostId = hostId;
            this.playerName = playerName!;
            this.platform = platform!;
            this.playerLevel = playerLevel!;
            this.puid = puid!;
            this.friendCode = friendCode!;
        }
    }

    static deserializeFromReader(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();

            const clientId = reader.int32();
            const hostId = reader.int32();
            const playerName = reader.string();
            const platform = reader.read(PlatformSpecificData);
            const playerLevel = reader.upacked();
            const puid = reader.string();
            const friendCode = reader.string();

            return new JoinGameMessage(code, clientId, hostId, playerName, platform, playerLevel, puid, friendCode);
        } else {
            const code = reader.int32();
            const crossPlayBlocked = reader.bool();

            return new JoinGameMessage(code, !crossPlayBlocked);
        }
    }

    serializeToWriter(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.int32(this.gameId);
            writer.int32(this.clientId);
            writer.int32(this.hostId);
            writer.string(this.playerName);
            writer.write(this.platform);
            writer.upacked(this.playerLevel);
            writer.string(this.puid);
            writer.string(this.friendCode);
        } else {
            writer.int32(this.gameId);
            writer.bool(!this.crossPlay);
        }
    }

    clone() {
        if (this.hostId !== undefined) {
            return new JoinGameMessage(
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
        return new JoinGameMessage(this.gameId, this.crossPlay);
    }
}
