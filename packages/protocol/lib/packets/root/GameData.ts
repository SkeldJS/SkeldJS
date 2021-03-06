import { RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { BaseGameDataMessage } from "../game";

import { BaseRootMessage } from "./BaseRootMessage";

export class GameDataMessage extends BaseRootMessage {
    static tag = RootMessageTag.GameData as const;
    tag = RootMessageTag.GameData as const;

    code: number;
    children: BaseGameDataMessage[];

    constructor(code: string | number, children: BaseGameDataMessage[]) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.children = children;
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const code = reader.int32();

        const rootMessages = decoder.types.get("gamedata");

        if (!rootMessages) return new GameDataMessage(code, []);

        const children: BaseGameDataMessage[] = [];

        while (reader.left) {
            const [tag, mreader] = reader.message();

            const rootMessageClass = rootMessages.get(tag);

            if (!rootMessageClass) continue;

            const root = rootMessageClass.Deserialize(
                mreader,
                direction,
                decoder
            );
            children.push(root as BaseGameDataMessage);
        }

        return new GameDataMessage(code, children);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.int32(this.code);

        const rootMessages = decoder.types.get("gamedata");

        if (!rootMessages) return;

        for (const message of this.children) {
            if (!rootMessages.has(message.tag)) continue;

            writer.begin(message.tag);
            writer.write(message, direction, decoder);
            writer.end();
        }
    }
}
