import { RootMessageTag } from "@skeldjs/constant";
import { GameCode, HazelReader, HazelWriter } from "@skeldjs/util";

import { GameSettings } from "../../misc";
import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export class HostGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.HostGame as const;
    messageTag = RootMessageTag.HostGame as const;

    readonly code!: number;
    readonly gameSettings!: GameSettings;
    readonly filters!: string[];

    constructor(code: string | number);
    constructor(gameSettings: GameSettings, filters: string[]);
    constructor(
        gameSettingsOrCode: GameSettings | string | number,
        filters?: string[]
    ) {
        super();

        if (typeof gameSettingsOrCode === "string") {
            this.code = GameCode.convertStringToInt(gameSettingsOrCode);
        } else if (typeof gameSettingsOrCode === "number") {
            this.code = gameSettingsOrCode;
        } else {
            this.gameSettings = gameSettingsOrCode;
            this.filters = filters!;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const code = reader.int32();

            return new HostGameMessage(code);
        } else {
            const gameOptions = GameSettings.Deserialize(reader);
            /*const crossplayFlags = */reader.uint32(); // crossplayFlags not used yet
            const numFilters = reader.upacked();
            const filters = reader.list(numFilters, r => r.string());

            return new HostGameMessage(gameOptions, filters);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.int32(this.code);
        } else {
            writer.write(this.gameSettings, 7);
            writer.int32(2 ** 31 - 1);//2 ** 31 - 1); // cross play flags, max int for any crossplay
            writer.upacked(this.filters.length);
            for (const filter of this.filters) {
                writer.string(filter);
            }
        }
    }

    clone() {
        if (this.gameSettings) {
            return new HostGameMessage(this.gameSettings, [...this.filters]);
        } else {
            return new HostGameMessage(this.code);
        }
    }
}
