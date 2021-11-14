import { HazelReader, HazelWriter } from "@skeldjs/util";
import { PlatformSpecificData } from "./PlatformSpecificData";

export class PlayerJoinData {
    constructor(
        public readonly clientId: number,
        public readonly playerName: string,
        public readonly platform: PlatformSpecificData,
        public readonly playerLevel: number
    ) {}

    static Deserialize(reader: HazelReader) {
        const clientId = reader.packed();
        const playerName = reader.string();
        const platform = reader.read(PlatformSpecificData);
        const playerLevel = reader.upacked();

        return new PlayerJoinData(clientId, playerName, platform, playerLevel);
    }

    Serialize(writer: HazelWriter) {
        writer.packed(this.clientId);
        writer.string(this.playerName);
        writer.write(this.platform);
        writer.upacked(this.playerLevel);
    }

    clone() {
        return new PlayerJoinData(
            this.clientId,
            this.playerName,
            new PlatformSpecificData(
                this.platform.platformTag,
                this.platform.platformName,
                this.platform.platformId
            ),
            this.playerLevel
        );
    }
}
