import { GameKeyword, GameMap, QuickChatMode } from "@skeldjs/constant";

export interface FindGamesOptions {
    /**
     * An array of map IDs of maps to search for.
     * @default [GameMap.TheSkeld, GameMap.MiraHQ, GameMap.Polus, GameMap.AprilFoolsTheSkeld, GameMap.Airship]
     */
    maps: (GameMap|number)[];
    /**
     * The number of impostors in games to search for.
     *
     * Set to `0` for any number of impostors.
     * @default 0
     */
    numImpostors: number;
    /**
     * The language of the chat in games to search for.
     *
     * @default GameKeyword.All
     */
    chatLanguage: GameKeyword;
    /**
     * The quick chat mode in games to search for.
     *
     * @default QuickChatMode.FreeChat
     */
    quickChatMode: QuickChatMode;
    /**
     * Further filter the game by set tags.
     *
     * @default ["Beginner", "Casual", "Serious", "Expert"]
     */
    filterTags: string[];
}
