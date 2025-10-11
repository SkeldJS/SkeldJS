import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { PlayerJoinData } from "../../misc";

import { BaseRootMessage } from "./BaseRootMessage";

export class JoinedGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinedGame as const;
    messageTag = RootMessageTag.JoinedGame as const;

    readonly gameId: number;
    readonly clientId: number;
    readonly hostId: number;
    readonly otherPlayers: PlayerJoinData[];

    constructor(
        gameId: number,
        clientId: number,
        hostId: number,
        otherPlayers: PlayerJoinData[]
    ) {
        super();

        this.gameId = gameId;

        this.clientId = clientId;
        this.hostId = hostId;
        this.otherPlayers = otherPlayers;
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        const clientId = reader.int32();
        const hostId = reader.int32();
        const otherPlayers = reader.list(reader => reader.read(PlayerJoinData));

        return new JoinedGameMessage(code, clientId, hostId, otherPlayers);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.int32(this.clientId);
        writer.int32(this.hostId);
        writer.list(true, this.otherPlayers, player => writer.write(player));
    }

    clone() {
        return new JoinedGameMessage(this.gameId, this.clientId, this.hostId, [...this.otherPlayers.map(player => player.clone())]);
    }
}
