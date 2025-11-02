import { RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseRootMessage } from "./BaseRootMessage";
import { PlatformSpecificData } from "../../misc";

export class QueryPlatformIdsMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.QueryPlatformIds;

    constructor(public readonly gameCode: number, public readonly roomPlayersPlatforms: PlatformSpecificData[]) {
        super(QueryPlatformIdsMessage.messageTag);
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
    
    clone(): BaseRootMessage {
        return new QueryPlatformIdsMessage(this.gameCode, this.roomPlayersPlatforms.map(platform => platform.clone()));
    }
}
