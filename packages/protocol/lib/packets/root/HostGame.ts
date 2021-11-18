import { RootMessageTag } from "@skeldjs/constant";
import { Code2Int, HazelReader, HazelWriter } from "@skeldjs/util";

import { GameSettings } from "../../misc";
import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class HostGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.HostGame as const;
    messageTag = RootMessageTag.HostGame as const;

    readonly code!: number;
    readonly gameSettings!: GameSettings;

    constructor(code: string | number);
    constructor(gameSettings: GameSettings);
    constructor(
        gameSettingsOrCode: GameSettings | string | number
    ) {
        super();

        if (typeof gameSettingsOrCode === "string") {
            this.code = Code2Int(gameSettingsOrCode);
        } else if (typeof gameSettingsOrCode === "number") {
            this.code = gameSettingsOrCode;
        } else {
            this.gameSettings = gameSettingsOrCode;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();

            return new HostGameMessage(code);
        } else {
            const gameOptions = GameSettings.Deserialize(reader);

            return new HostGameMessage(gameOptions);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.int32(this.code);
        } else {
            writer.write(this.gameSettings);
            writer.int32(2 ** 31 - 1); // cross play flags, max int for any crossplay
        }
    }

    clone() {
        if (this.gameSettings) {
            return new HostGameMessage(this.gameSettings);
        } else {
            return new HostGameMessage(this.code);
        }
    }
}
