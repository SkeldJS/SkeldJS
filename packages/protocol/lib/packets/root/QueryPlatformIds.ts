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

    static Deserialize(reader: HazelReader) {
        const gameCode = reader.int32();
        const roomPlayersPlatforms = Array<PlatformSpecificData>();

        while (reader.left) {
            roomPlayersPlatforms.push(PlatformSpecificData.Deserialize(reader));
        }

        return new QueryPlatformIdsMessage(gameCode, roomPlayersPlatforms);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.gameCode);

        for (const playerPlatform of this.roomPlayersPlatforms) {
            playerPlatform.Serialize(writer);
        }
    }
}
