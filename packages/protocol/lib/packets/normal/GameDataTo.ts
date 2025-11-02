import { RootMessageTag } from "@skeldjs/au-constants";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { BaseGameDataMessage } from "../game";

import { BaseRootMessage } from "./BaseRootMessage";
import { UnknownGameDataMessage } from "../game/Unknown";

export class GameDataToMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.GameDataTo;

    constructor(
        public readonly gameId: number,
        public readonly recipientId: number,
        public readonly children: BaseGameDataMessage[]
) {
        super(GameDataToMessage.messageTag);
    }
    
    static deserializeFromReader(reader: HazelReader) {
        const gameId = reader.int32();
        const recipientId = reader.packed();
        const children: UnknownGameDataMessage[] = [];
        while (reader.left) {
            const [ tag, dataReader ] = reader.message();
            children.push(new UnknownGameDataMessage(tag, dataReader));
        }
        return new GameDataToMessage(gameId, recipientId, children);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
        writer.packed(this.recipientId);

        for (const child of this.children) {
            writer.begin(child.messageTag);
            writer.write(child);
            writer.end();
        }
    }

    clone() {
        return new GameDataToMessage(this.gameId, this.recipientId, this.children);
    }
}