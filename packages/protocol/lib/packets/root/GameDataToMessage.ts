import { RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { PacketDecoder } from "../../PacketDecoder";
import { MessageDirection } from "../../PacketDecoder";
import { BaseGameDataMessage } from "../game";

import { BaseRootMessage } from "./BaseRootMessage";

export class GameDataToMessage extends BaseRootMessage {
    static tag = RootMessageTag.GameDataTo as const;
    tag = RootMessageTag.GameDataTo as const;

    code: number;
    recipientid: number;
    _children: BaseGameDataMessage[]; // Starts with _ to avoid children getting emitted.

    constructor(
        code: string | number,
        recipientid: number,
        children: BaseGameDataMessage[]
    ) {
        super();

        if (typeof code === "string") {
            this.code = Code2Int(code);
        } else {
            this.code = code;
        }

        this.recipientid = recipientid;
        this._children = children;
    }

    static Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        const code = reader.int32();
        const recipientid = reader.packed();

        const rootMessages = decoder.types.get("gamedata");

        if (!rootMessages) return new GameDataToMessage(code, recipientid, []);

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

        return new GameDataToMessage(code, recipientid, children);
    }

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ) {
        writer.int32(this.code);
        writer.packed(this.recipientid);

        const rootMessages = decoder.types.get("gamedata");

        if (!rootMessages) return;

        for (const message of this._children) {
            if (!rootMessages.has(message.tag)) continue;

            writer.begin(message.tag);
            writer.write(message, direction, decoder);
            writer.end();
        }
    }
}
