import { GameMap } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { PlatformSpecificData } from "./PlatformSpecificData";

export class GameListing {
    readonly gameId: number;

    constructor(
        gameId: number,
        public readonly ip: string,
        public readonly port: number,
        public readonly hostName: string,
        public readonly numPlayers: number,
        public readonly age: number,
        public readonly map: GameMap,
        public readonly numImpostors: number,
        public readonly maxPlayers: number,
        public readonly platform: PlatformSpecificData
    ) {
        this.gameId = gameId;
    }

    static deserializeFromReader(reader: HazelReader) {
        const ip = reader.bytes(4).buffer.join(".");
        const port = reader.uint16();
        const gameId = reader.int32();
        const hostName = reader.string();
        const numPlayers = reader.uint8();
        const age = reader.upacked();
        const map = reader.uint8();
        const numImpostors = reader.uint8();
        const maxPlayers = reader.uint8();
        const platform = reader.read(PlatformSpecificData);

        return new GameListing(
            gameId,
            ip,
            port,
            hostName,
            numPlayers,
            age,
            map,
            numImpostors,
            maxPlayers,
            platform
        );
    }

    serializeToWriter(writer: HazelWriter) {
        const split = this.ip.split(".");
        for (const part of split) {
            writer.uint8(parseInt(part));
        }
        writer.uint16(this.port);
        writer.int32(this.gameId);
        writer.string(this.hostName);
        writer.uint8(this.numPlayers);
        writer.upacked(this.age);
        writer.uint8(this.map);
        writer.uint8(this.numImpostors);
        writer.uint8(this.maxPlayers);
        writer.uint8(this.platform.platformTag);
        writer.string(this.platform.platformName);
    }

    clone() {
        return new GameListing(
            this.gameId,
            this.ip,
            this.port,
            this.hostName,
            this.numPlayers,
            this.age,
            this.map,
            this.numImpostors,
            this.maxPlayers,
            new PlatformSpecificData(
                this.platform.platformTag,
                this.platform.platformName,
                this.platform.platformId
            )
        );
    }
}
