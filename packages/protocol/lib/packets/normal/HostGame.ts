import { RootMessageTag } from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { GameSettings } from "../../misc";
import { BaseRootMessage } from "./BaseRootMessage";

export class C2SHostGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.HostGame;

    constructor(public readonly gameSettings: GameSettings, public readonly filters: string[]) {
        super(C2SHostGameMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const gameOptions = GameSettings.deserializeFromReader(reader, true);
        /*const crossplayFlags = */reader.uint32(); // crossplayFlags not used yet
        const numFilters = reader.upacked();
        const filters = reader.list(numFilters, r => r.string());

        return new C2SHostGameMessage(gameOptions, filters);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.write(this.gameSettings, true, 10);
        writer.int32(2 ** 31 - 1);//2 ** 31 - 1); // cross play flags, max int for any crossplay
        writer.upacked(this.filters.length);
        for (const filter of this.filters) {
            writer.string(filter);
        }
    }

    clone() {
        return new C2SHostGameMessage(this.gameSettings, [...this.filters]);
    }
}

export class S2CHostGameMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.HostGame;

    constructor(public readonly gameId: number) {
        super(S2CHostGameMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const code = reader.int32();
        return new S2CHostGameMessage(code);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.int32(this.gameId);
    }

    clone() {
        return new S2CHostGameMessage(this.gameId);
    }
}