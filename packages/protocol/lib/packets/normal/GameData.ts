import { RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseGameDataMessage } from "../game";

import { BaseRootMessage } from "./BaseRootMessage";
import { UnknownGameDataMessage } from "../game/Unknown";

export class GameDataMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.GameData;

    constructor(public readonly gameId: number, public readonly children: BaseGameDataMessage[]) {
        super(GameDataMessage.messageTag);
    }
    
    static deserializeFromReader(reader: HazelReader) {
        const gameId = reader.int32();
        const children: UnknownGameDataMessage[] = [];
        while (reader.left) {
            const [ tag, dataReader ] = reader.message();
            children.push(new UnknownGameDataMessage(tag, dataReader));
        }
        return new GameDataMessage(gameId, children);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        for (const child of this.children) {
            writer.begin(child.messageTag);
            writer.write(child);
            writer.end();
        }
    }

    clone() {
        return new GameDataMessage(this.gameId, this.children);
    }
}