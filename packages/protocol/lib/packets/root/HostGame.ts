import { QuickChatMode, RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { GameSettings } from "../../misc";
import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class HostGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.HostGame as const;
    messageTag = RootMessageTag.HostGame as const;

    readonly code!: number;
    readonly options!: GameSettings;
    readonly quickchatMode!: QuickChatMode;

    constructor(code: string | number);
    constructor(options: GameSettings, quickchat: QuickChatMode);
    constructor(
        options: GameSettings | string | number,
        quickchat?: QuickChatMode
    ) {
        super();

        if (typeof options === "string") {
            this.code = Code2Int(options);
        } else if (typeof options === "number") {
            this.code = options;
        } else if (typeof quickchat === "number") {
            this.options = options;
            this.quickchatMode = quickchat;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();

            return new HostGameMessage(code);
        } else {
            const gameOptions = GameSettings.Deserialize(reader);
            const quickChat = reader.uint8();

            return new HostGameMessage(gameOptions, quickChat);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.int32(this.code);
        } else {
            writer.write(this.options);
            writer.uint8(this.quickchatMode);
        }
    }

    clone() {
        if (this.options) {
            return new HostGameMessage(this.options, this.quickchatMode);
        } else {
            return new HostGameMessage(this.code);
        }
    }
}
