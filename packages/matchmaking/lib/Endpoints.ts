import { GameKeyword, QuickChatMode } from "@skeldjs/constant";
import {
    FindGameCodeServerResponseBody,
    FindHostServerResponseBody,
    GetUserRequestBody,
    GetUserResponseBody,
    RequestGameListResponseBody
} from "./types";

/**
 * Represents an endpoint that can be used to type request and response bodies.
 */
export type Endpoint<Req, Res> = string & { __req: Req; __res: Res };

/**
 * All endpoints used by the Among Us HTTP matchmaker.
 */
export const Endpoints = {
    /**
     * Used by the game to find the server that a lobby is hosted on.
     * @param gameId The game code of the lobby to find the server for.
     * @returns The server that the lobby is hosted on.
     */
    FindGameCodeServer: (gameId: number) => `/api/games?gameId=${gameId}` as Endpoint<never, FindGameCodeServerResponseBody>,
    /**
     * Used to find a valid server that the client can connect to in order to host a game.
     * @returns A server that the client can host a game on.
     */
    FindHostServer: () => `/api/games` as Endpoint<never, FindHostServerResponseBody>,
    /**
     * Used to get the matchmaking token for the server.
     * @returns A matchmaking token to use while connecting.
     */
    GetToken: () => `/api/user` as Endpoint<GetUserRequestBody, GetUserResponseBody>,
    /**
     * Request a short list of games that the client is able to connect to, filtered by certain parameters
     * @param mapBitfield Map bitfield of games to find.
     * @param lang The language of games to find.
     * @param quickChat The chat mode of games to find.
     * @param platformFlags Crossplay bitfield for platforms to find.
     * @param numImpostors The number of impostors of games to find.
     * @returns Games that the client can connect to, given the parameters.
     */
    RequestGameList: (mapBitfield: number, lang: GameKeyword, quickChat: QuickChatMode, platformFlags: number, numImpostors: number) =>
        `/api/games?mapId=${mapBitfield}&lang=${lang}&quickChat=${quickChat}&platformFlags=${platformFlags}&numImpostors=${numImpostors}` as Endpoint<never, RequestGameListResponseBody>
};
