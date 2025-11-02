import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { Platform } from "@skeldjs/au-constants";

export class PlatformSpecificData {
    constructor(
        public readonly platformTag: Platform,
        public readonly platformName: string,
        /**
         * The client's Xbox or PSN platform ID.
         */
        public readonly platformId?: bigint
    ) {}

    static deserializeFromReader(reader: HazelReader) {
        const [ platformTag, platformReader ] = reader.message();
        const platformName = platformReader.string();

        if (platformTag == Platform.Xbox || platformTag === Platform.Playstation) {
            const platformId = platformReader.uint64();

            return new PlatformSpecificData(platformTag, platformName, platformId);
        }

        return new PlatformSpecificData(platformTag, platformName);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.begin(this.platformTag);
        writer.string(this.platformName);
        if (this.platformTag === Platform.StandaloneWin10 || this.platformTag === Platform.Xbox || this.platformTag === Platform.Playstation) {
            writer.uint64(this.platformId || BigInt(0));
        }
        writer.end();
    }

    clone(): PlatformSpecificData {
        return new PlatformSpecificData(
            this.platformTag,
            this.platformName,
            this.platformId,
        );
    }
}
