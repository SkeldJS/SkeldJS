import { QuickChatMode, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { GameOptions } from "../../misc";
import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class HostGameMessage extends BaseRootMessage {
    static tag = RootMessageTag.HostGame as const;
    tag = RootMessageTag.HostGame as const;

    readonly code!: number;
    readonly options!: GameOptions;
    readonly quickchat!: QuickChatMode;

    constructor(code: string | number);
    constructor(options: GameOptions, quickchat: QuickChatMode);
    constructor(
        options: GameOptions | string | number,
        quickchat?: QuickChatMode
    ) {
        super();

        if (typeof options === "string") {
            this.code = Code2Int(options);
        } else if (typeof options === "number") {
            this.code = options;
        } else if (typeof quickchat === "number") {
            this.options = options;
            this.quickchat = quickchat;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();

            return new HostGameMessage(code);
        } else {
            const gameOptions = GameOptions.Deserialize(reader);
            const quickChat = reader.uint8();

            return new HostGameMessage(gameOptions, quickChat);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.int32(this.code);
        } else {
            writer.write(this.options);
            writer.uint8(this.quickchat);
        }
    }
}
