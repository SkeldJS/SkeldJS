import { HazelReader, HazelWriter } from "@skeldjs/util";

export enum ModPluginSide {
    Both,
    Clientside
}

export class ReactorMod {
    constructor(
        public readonly modId: string,
        public readonly version: string,
        public readonly networkSide: ModPluginSide
    ) {}

    static Deserialize(reader: HazelReader) {
        const modId = reader.string();
        const version = reader.string();
        const networkSide = reader.uint8();

        return new ReactorMod(modId, version, networkSide);
    }

    Serialize(writer: HazelWriter) {
        writer.string(this.modId);
        writer.string(this.version);
        writer.uint8(this.networkSide);
    }
}
