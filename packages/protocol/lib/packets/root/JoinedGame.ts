import { RootMessageTag } from "@skeldjs/constant";
import { GameCode, HazelReader, HazelWriter } from "@skeldjs/util";
import { PlayerJoinData } from "../../misc";

import { BaseRootMessage } from "./BaseRootMessage";

export class JoinedGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinedGame as const;
    messageTag = RootMessageTag.JoinedGame as const;

    readonly code: number;
    readonly clientId: number;
    readonly hostId: number;
    readonly otherPlayers: PlayerJoinData[];

    constructor(
        code: string | number,
        clientId: number,
        hostId: number,
        otherPlayers: PlayerJoinData[]
    ) {
        super();

        if (typeof code === "string") {
            this.code = GameCode.convertStringToInt(code);
        } else {
            this.code = code;
        }

        this.clientId = clientId;
        this.hostId = hostId;
        this.otherPlayers = otherPlayers;
    }

    static Deserialize(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.int32();
        const hostId = reader.int32();
        const otherPlayers = reader.list(reader => reader.read(PlayerJoinData));

        return new JoinedGameMessage(code, clientId, hostId, otherPlayers);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.code);
        writer.int32(this.clientId);
        writer.int32(this.hostId);
        writer.list(true, this.otherPlayers, player => writer.write(player));
    }

    clone() {
        return new JoinedGameMessage(this.code, this.clientId, this.hostId, [...this.otherPlayers.map(player => player.clone())]);
    }
}
