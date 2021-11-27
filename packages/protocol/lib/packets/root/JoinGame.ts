import { DisconnectReason, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";
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

    readonly error!: DisconnectReason;
    readonly message!: string;

    constructor(code: string | number);
    constructor(error: DisconnectReason, message?: string);
    constructor(
        code: string | number,
        clientId: number,
        hostId: number,
        playerName: string,
        platform: PlatformSpecificData,
        playerLevel: number
    );
    constructor(
        code: string | number,
        clientId?: number | string,
        hostId?: number,
        playerName?: string,
        platform?: PlatformSpecificData,
        playerLevel?: number
    ) {
        super();

        if (typeof code === "number") {
            if (DisconnectReason[code]) {
                this.error = code;

                if (typeof clientId === "string") {
                    this.message = clientId;
                }
            } else {
                this.code = code;
            }
        } else {
            this.code = Code2Int(code);
        }

        if (typeof hostId === "number") {
            this.clientId = clientId as number;
            this.hostId = hostId;
            this.playerName = playerName!;
            this.platform = platform!;
            this.playerLevel = playerLevel!;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();

            if (!DisconnectReason[code]) {
                const clientId = reader.int32();
                const hostId = reader.int32();
                const playerName = reader.string();
                const platform = reader.read(PlatformSpecificData);
                const playerLevel = reader.upacked();

                return new JoinGameMessage(code, clientId, hostId, playerName, platform, playerLevel);
            }

            const message =
                code === DisconnectReason.Custom && reader.left
                    ? reader.string()
                    : undefined;

            return new JoinGameMessage(code, message);
        } else {
            const code = reader.int32();

            return new JoinGameMessage(code);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            if (this.code) {
                writer.int32(this.code);
                writer.int32(this.clientId);
                writer.int32(this.hostId);
                writer.string(this.playerName);
                writer.write(this.platform);
                writer.upacked(this.playerLevel);
            } else {
                writer.int32(this.error);
                if (
                    this.error === DisconnectReason.Custom &&
                    typeof this.message === "string"
                ) {
                    writer.string(this.message);
                }
            }
        } else {
            writer.int32(this.code ?? this.error);
        }
    }

    clone() {
        if (this.hostId) {
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
                this.playerLevel
            );
        }
        if (this.error !== undefined) {
            return new JoinGameMessage(this.error, this.message);
        }
        return new JoinGameMessage(this.code);
    }
}
