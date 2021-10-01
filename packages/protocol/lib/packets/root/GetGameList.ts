import {
    GameMap,
    GetGameListTag,
    QuickChatMode,
    RootMessageTag,
} from "@skeldjs/constant";

import { HazelReader, HazelWriter } from "@skeldjs/util";

import { GameSettings, GameListing } from "../../misc";
import { MessageDirection } from "../../PacketDecoder";
import { BaseRootMessage } from "./BaseRootMessage";

export type GameCounts = Partial<Record<GameMap, number>>;

export class GetGameListMessage extends BaseRootMessage {
    static messageTag = RootMessageTag.GetGameListV2 as const;
    messageTag = RootMessageTag.GetGameListV2 as const;

    readonly options!: GameSettings;
    readonly quickchat!: QuickChatMode;

    readonly gameCounts?: GameCounts;
    readonly gameList!: GameListing[];

    constructor(options: GameSettings, quickchat: QuickChatMode);
    constructor(gameList: GameListing[], gameCounts?: GameCounts);
    constructor(
        arg0: GameSettings | GameListing[],
        arg1?: QuickChatMode | GameCounts
    ) {
        super();

        if (Array.isArray(arg0)) {
            this.gameList = arg0 as GameListing[];
            this.gameCounts = arg1 as GameCounts;
        } else {
            this.options = arg0 as GameSettings;
            this.quickchat = arg1 as QuickChatMode;
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

            return new GetGameListMessage(gameList, gameCounts);
        } else {
            reader.upacked(); // Skip hard-coded value at 0x02
            const options = GameSettings.Deserialize(reader);
            const quickchat = reader.uint8();

            return new GetGameListMessage(options, quickchat);
        }
    }

    Serialize(writer: HazelWriter, direction: MessageDirection) {
        if (direction === MessageDirection.Clientbound) {
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
        } else {
            writer.upacked(0x02);
            writer.write(this.options);
            writer.uint8(this.quickchat);
        }
    }

    clone() {
        if (this.options) {
            return new GetGameListMessage(this.options.clone(), this.quickchat);
        } else {
            return new GetGameListMessage(this.gameList.map(gameList => gameList.clone()), { ... this.gameCounts });
        }
    }
}
