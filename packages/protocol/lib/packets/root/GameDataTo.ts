import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { BaseGameDataMessage } from "../game";

import { BaseRootMessage } from "./BaseRootMessage";

export class GameDataToMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.GameDataTo as const;
    messageTag = RootMessageTag.GameDataTo as const;

    gameId: number;
    recipientId: number;
    _children: BaseGameDataMessage[]; // Starts with _ to avoid children getting emitted.

    constructor(
        gameId: number,
        recipientId: number,
        children: BaseGameDataMessage[]
    ) {
        super();

        this.gameId = gameId;

        this.recipientId = recipientId;
        this._children = children;
    }

    static deserializeFromReader(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const code = reader.int32();
        const recipientId = reader.packed();

        const children: BaseGameDataMessage[] = [];

        while (reader.left) {
            const [tag, mreader] = reader.message();

            const rootMessageClass = decoder.types.get(`gamedata:${tag}`);

            if (!rootMessageClass) continue;

            const root = rootMessageClass.deserializeFromReader(
                mreader,
                direction,
                decoder
            );
            children.push(root as BaseGameDataMessage);
        }

        return new GameDataToMessage(code, recipientId, children);
    }

    serializeToWriter(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.int32(this.gameId);
        writer.packed(this.recipientId);


        for (const message of this._children) {
            if (!decoder.types.has(`gamedata:${message.messageTag}`))
                continue;

            writer.begin(message.messageTag);
            writer.write(message, direction, decoder);
            writer.end();
        }
    }

    clone() {
        return new GameDataToMessage(this.gameId, this.recipientId, this._children.map(child => child.clone()));
    }
}
