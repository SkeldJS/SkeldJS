import { HazelReader, HazelWriter } from "@skeldjs/util";
import { ModFlags } from "./constants";

export class ReactorMod {
    constructor(
        public readonly id: string,
        public readonly version: string,
        public readonly flags: number,
        public readonly name: string
    ) {}

    static Deserialize(reader: HazelReader) {
        const id = reader.string();
        const version = reader.string();
        const flags = reader.uint16();

        if ((flags & ModFlags.RequireOnAllClients) > 0) {
            const name = reader.string();
            return new ReactorMod(id, version, flags, name);
        }

        return new ReactorMod(id, version, flags, "");
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.id);
        writer.string(this.version);
        writer.uint16(this.flags);
        if (this.flags & ModFlags.RequireOnAllClients) {
            writer.string(this.name);
        }
    }
}
