import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { BaseGameDataMessage } from "../game";

import { BaseRootMessage } from "./BaseRootMessage";

export class UnknownGameDataMessage extends BaseGameDataMessage {
    static messageTag = 255 as const;

    constructor(
        public readonly messageTag: number,
        public readonly bytes: Buffer
    ) {
        super();
    }

    serializeToWriter(writer: HazelWriter) {
        writer.bytes(this.bytes);
    }
}

export class GameDataMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.GameData as const;
    messageTag = RootMessageTag.GameData as const;

    gameId: number;
    children: BaseGameDataMessage[];

    constructor(gameId: number, children: BaseGameDataMessage[]) {
        super();

        this.gameId = gameId;

        this.children = children;
    }

    static deserializeFromReader(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const code = reader.int32();
        const children: BaseGameDataMessage[] = [];

        while (reader.left) {
            const [tag, mreader] = reader.message();

            const rootMessageClass = decoder.types.get(`gamedata:${tag}`);

            if (!rootMessageClass) {
                children.push(new UnknownGameDataMessage(tag, mreader.buffer));
                continue;
            }

            const root = rootMessageClass.deserializeFromReader(
                mreader,
                direction,
                decoder
            );
            children.push(root as BaseGameDataMessage);
        }

        return new GameDataMessage(code, children);
    }

    serializeToWriter(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.int32(this.gameId);

        for (const message of this.children) {
            if (!decoder.config.writeUnknownGameData && !decoder.types.has(`gamedata:${message.messageTag}`))
                continue;

            writer.begin(message.messageTag);
            writer.write(message, direction, decoder);
            writer.end();
        }
    }

    clone() {
        return new GameDataMessage(this.gameId, this.children.map(child => child.clone()));
    }
}
