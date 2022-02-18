import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { BaseRootMessage } from "./BaseRootMessage";
import { PlatformSpecificData } from "../../misc";

export class QueryPlatformIdsMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.QueryPlatformIds as const;
    messageTag = RootMessageTag.QueryPlatformIds as const;

    readonly gameCode: number
    readonly roomPlayersPlatformSpecificData: PlatformSpecificData[]

    constructor(gameCode: number, roomPlayersPlatformSpecificData: PlatformSpecificData[]) {
        super();

        this.gameCode = gameCode;
        this.roomPlayersPlatformSpecificData = roomPlayersPlatformSpecificData;
    }

    static Deserialize(reader: HazelReader) {
        const gameCode = reader.int32();
        const roomPlayersPlatformSpecificData = Array<PlatformSpecificData>();

        while (reader.left) {
            roomPlayersPlatformSpecificData.push(PlatformSpecificData.Deserialize(reader));
        }

        return new QueryPlatformIdsMessage(gameCode, roomPlayersPlatformSpecificData);
    }

    Serialize(writer: HazelWriter) {
        writer.int32(this.gameCode);

        for (const playerPlatformSpecificData of this.roomPlayersPlatformSpecificData) {
            playerPlatformSpecificData.Serialize(writer);
        }
    }
}
