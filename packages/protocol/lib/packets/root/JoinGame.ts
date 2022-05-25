import { RootMessageTag } from "@skeldjs/constant";
import { GameCode, HazelReader, HazelWriter } from "@skeldjs/util";
import { PlatformSpecificData } from "../../misc";

import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class JoinGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinGame as const;
    messageTag = RootMessageTag.JoinGame as const;

    readonly code!: number;
    readonly clientId!: number;
    readonly hostId!: number;
    readonly playerName!: string;
    readonly platform!: PlatformSpecificData;
    readonly playerLevel!: number;
    readonly puid!: string;
    readonly friendCode!: string;

    readonly message!: string;

    constructor(code: string | number);
    constructor(
        code: string | number,
        clientId: number,
        hostId: number,
        playerName: string,
        platform: PlatformSpecificData,
        playerLevel: number,
        puid: string,
        friendCode: string
    );
    constructor(
        code: string | number,
        clientId?: number | string,
        hostId?: number,
        playerName?: string,
        platform?: PlatformSpecificData,
        playerLevel?: number,
        puid?: string,
        friendCode?: string
    ) {
        super();

        if (typeof code === "number") {
            this.code = code;
        } else {
            this.code = GameCode.convertStringToInt(code);
        }

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

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
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

            return new JoinGameMessage(code);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.int32(this.code);
            writer.int32(this.clientId);
            writer.int32(this.hostId);
            writer.string(this.playerName);
            writer.write(this.platform);
            writer.upacked(this.playerLevel);
            writer.string(this.puid);
            writer.string(this.friendCode);
        } else {
            writer.int32(this.code);
            writer.bool(false);
        }
    }

    clone() {
        if (this.hostId !== undefined) {
            return new JoinGameMessage(
                this.code,
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
        return new JoinGameMessage(this.code);
    }
}
