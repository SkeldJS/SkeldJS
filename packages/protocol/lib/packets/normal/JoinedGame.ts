import { RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { PlayerJoinData } from "../../misc";

import { BaseRootMessage } from "./BaseRootMessage";

export class JoinedGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.JoinedGame;

    constructor(
        public readonly gameId: number,
        public readonly clientId: number,
        public readonly hostId: number,
        public readonly otherPlayers: PlayerJoinData[]
    ) {
        super(JoinedGameMessage.messageTag);
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
