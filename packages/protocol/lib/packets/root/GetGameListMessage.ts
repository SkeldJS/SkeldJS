import {
    GameMap,
    GetGameListTag,
    QuickChatMode,
    RootMessageTag,
} from "@skeldjs/constant";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { GameOptions, GameListing } from "../../misc";
import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export type GameCounts = Record<GameMap, number>;

export class GetGameListMessage extends BaseRootMessage {
    static tag = RootMessageTag.GetGameListV2 as const;
    tag = RootMessageTag.GetGameListV2 as const;

    readonly options: GameOptions;
    readonly quickchat: QuickChatMode;

    readonly gameCounts: GameCounts;
    readonly gameList: GameListing[];

    constructor(options: GameOptions, quickchat: QuickChatMode);
    constructor(gameCounts: GameCounts, gameList: GameListing[]);
    constructor(
        arg0: GameOptions | GameCounts,
        arg1: QuickChatMode | GameListing[]
    ) {
        super();

        if (Array.isArray(arg1)) {
            this.gameCounts = arg0 as GameCounts;
            this.gameList = arg1;
        } else {
            this.options = arg0 as GameOptions;
            this.quickchat = arg1;
        }
    }

    static Deserialize(reader: HazelReader, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            const gameCounts: Partial<GameCounts> = {};
            const gameList = [];

            while (reader.left) {
                const [tag, mreader] = reader.message();

                switch (tag) {
                    case GetGameListTag.GameCounts:
                        gameCounts[GameMap.TheSkeld] = reader.uint32();
                        gameCounts[GameMap.MiraHQ] = reader.uint32();
                        gameCounts[GameMap.Polus] = reader.uint32();
                        break;
                    case GetGameListTag.GameList:
                        while (mreader.left) {
                            const [, lreader] = reader.message();

                            const listing = GameListing.Deserialize(lreader);
                            gameList.push(listing);
                        }
                        break;
                }
            }

            return new GetGameListMessage(gameCounts as GameCounts, gameList);
        } else {
            reader.upacked(); // Skip hard-coded value at 0x02
            const options = GameOptions.Deserialize(reader);
            const quickchat = reader.uint8();

            return new GetGameListMessage(options, quickchat);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
            writer.begin(GetGameListTag.GameCounts);
            writer.uint32(this.gameCounts[GameMap.TheSkeld]);
            writer.uint32(this.gameCounts[GameMap.MiraHQ]);
            writer.uint32(this.gameCounts[GameMap.Polus]);
            writer.end();

            writer.begin(GetGameListTag.GameList);
            for (const listing of this.gameList) {
                writer.begin(0);
                writer.write(listing);
                writer.end();
            }
        } else {
            writer.upacked(0x02);
            writer.write(this.options);
            writer.uint8(this.quickchat);
        }
    }
}
