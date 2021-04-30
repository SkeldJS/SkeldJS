import { GameMap } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

export class GameListing {
    readonly code: number;

    constructor(
        code: string | number,
        public readonly ip: string,
        public readonly port: number,
        public readonly name: string,
        public readonly num_players: number,
        public readonly age: number,
        public readonly map: GameMap,
        public readonly num_impostors: number,
        public readonly max_players: number
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
        const name = reader.string();
        const num_players = reader.uint8();
        const age = reader.upacked();
        const map = reader.uint8();
        const num_impostors = reader.uint8();
        const max_players = reader.uint8();

        return new GameListing(
            code,
            ip,
            port,
            name,
            num_players,
            age,
            map,
            num_impostors,
            max_players
        );
    }

    Serialize(writer: HazelWriter) {
        const split = this.ip.split(".");
        for (const part of split) {
            writer.uint8(parseInt(part));
        }
        writer.uint16(this.port);
        writer.int32(this.code);
        writer.string(this.name);
        writer.uint8(this.num_players);
        writer.upacked(this.age);
        writer.uint8(this.map);
        writer.uint8(this.num_impostors);
        writer.uint8(this.max_players);
    }
}
