import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";
import { PlatformSpecificData } from "../../misc";

export class QueryPlatformIdsMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.QueryPlatformIds as const;
    messageTag = RootMessageTag.QueryPlatformIds as const;

    readonly gameCode: number;
    readonly roomPlayersPlatforms: PlatformSpecificData[];

    constructor(gameCode: number, roomPlayersPlatforms: PlatformSpecificData[]) {
        super();

        this.gameCode = gameCode;
        this.roomPlayersPlatforms = roomPlayersPlatforms;
    }

    static deserializeFromReader(reader: HazelReader) {
        const gameCode = reader.int32();
        const roomPlayersPlatforms = Array<PlatformSpecificData>();

        while (reader.left) {
            roomPlayersPlatforms.push(PlatformSpecificData.deserializeFromReader(reader));
        }

        return new QueryPlatformIdsMessage(gameCode, roomPlayersPlatforms);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameCode);

        for (const playerPlatform of this.roomPlayersPlatforms) {
            playerPlatform.serializeToWriter(writer);
        }
    }
}
