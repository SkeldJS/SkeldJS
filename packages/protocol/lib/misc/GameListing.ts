import { GameMap } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";
import { PlatformSpecificData } from "./PlatformSpecificData";

export class GameListing {
    readonly code: number;

    constructor(
        code: string | number,
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
        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }
    }

    static Deserialize(reader: HazelReader) {
        const ip = reader.bytes(4).buffer.join(".");
        const port = reader.uint16();
        const code = reader.int32();
        const hostName = reader.string();
        const numPlayers = reader.uint8();
        const age = reader.upacked();
        const map = reader.uint8();
        const numImpostors = reader.uint8();
        const maxPlayers = reader.uint8();
        const platform = reader.read(PlatformSpecificData);

        return new GameListing(
            code,
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

    Serialize(writer: HazelWriter) {
        const split = this.ip.split(".");
        for (const part of split) {
            writer.uint8(parseInt(part));
        }
        writer.uint16(this.port);
        writer.int32(this.code);
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
            this.code,
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
