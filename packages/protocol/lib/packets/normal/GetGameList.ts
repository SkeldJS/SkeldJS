import {
    GameMap,
    GetGameListTag,
    QuickChatMode,
    RootMessageTag,
} from "@skeldjs/au-constants";

import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { GameSettings, GameListing } from "../../misc";
import { BaseRootMessage } from "./BaseRootMessage";

export type GameCounts = Partial<Record<GameMap, number>>;

export class C2SGetGameListMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.GetGameListV2;

    constructor(public readonly options: GameSettings, public readonly quickchat: QuickChatMode) {
        super(C2SGetGameListMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        reader.upacked(); // Skip hard-coded value at 0x02
        const options = GameSettings.deserializeFromReader(reader, true);
        const quickchat = reader.uint8();

        return new C2SGetGameListMessage(options, quickchat);
    }

    serializeToWriter(writer: HazelWriter) {
        writer.upacked(0x02);
        writer.write(this.options, true, 10);
        writer.uint8(this.quickchat);
    }

    clone() {
        return new C2SGetGameListMessage(this.options.clone(), this.quickchat);
    }
}

export class S2CGetGameListMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.GetGameListV2;

    constructor(public readonly gameList: GameListing[], public readonly gameCounts?: GameCounts) {
        super(S2CGetGameListMessage.messageTag);
    }

    static deserializeFromReader(reader: HazelReader) {
        const gameCounts: Partial<GameCounts> = {};
        const gameList = [];

        while (reader.left) {
            const [tag, mreader] = reader.message();

            switch (tag) {
                case GetGameListTag.GameCounts:
                    gameCounts[GameMap.TheSkeld] = mreader.uint32();
                    gameCounts[GameMap.MiraHQ] = mreader.uint32();
                    gameCounts[GameMap.Polus] = mreader.uint32();
                    break;
                case GetGameListTag.GameList:
                    while (mreader.left) {
                        const [, lreader] = mreader.message();

                        const listing = lreader.read(GameListing);
                        gameList.push(listing);
                    }
                    break;
            }
        }

        return new S2CGetGameListMessage(gameList, gameCounts);
    }

    serializeToWriter(writer: HazelWriter) {
        if (this.gameCounts) {
            writer.begin(GetGameListTag.GameCounts);
            writer.uint32(this.gameCounts[GameMap.TheSkeld] || 0);
            writer.uint32(this.gameCounts[GameMap.MiraHQ] || 0);
            writer.uint32(this.gameCounts[GameMap.Polus] || 0);
            writer.end();
        }

        writer.begin(GetGameListTag.GameList);
        for (const listing of this.gameList) {
            writer.begin(0);
            writer.write(listing);
            writer.end();
        }
        writer.end();
    }

    clone() {
        return new S2CGetGameListMessage(this.gameList.map(gameList => gameList.clone()), { ... this.gameCounts });
    }
}
