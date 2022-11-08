import { request as undici } from "undici";
import { GameCode, VersionInfo } from "@skeldjs/util";
import { GameKeyword, GameMap, Language, Platform, QuickChatMode } from "@skeldjs/constant";

import { Endpoints } from "./Endpoints";
import { intToIpAddress } from "./util";
import { FindGameCodeServerResponseBody, FindHostServerResponseBody, RequestGameListResponseBody } from "./types";

export interface HostServer {
    ip: string;
    port: number;
}

export interface GameListing {
    gameCode: number;
    ip: string;
    port: number;
    hostName: string;
    numPlayers: number;
    age: number;
    map: GameMap;
    numImpostors: number;
    maxPlayers: number;
    platformName: string;
    platform: Platform;
}

export class SkeldjsMatchmakerRestClient {
    async getGameServer(gameId: string|number): Promise<HostServer> {
        if (typeof gameId === "string") {
            return this.getGameServer(GameCode.convertStringToInt(gameId));
        }

        const req = await undici(Endpoints.FindGameCodeServer(gameId), {
            method: "POST",
            headers: {
                "accept": "application/json",
                "authorization": "Bearer "
            }
        });

        if (req.statusCode < 200 || req.statusCode >= 300) {
            throw new Error("Request to get game token was not successful");
        }

        const json = await req.body.json() as FindGameCodeServerResponseBody;

        return {
            ip: intToIpAddress(json.Ip),
            port: json.Port
        };
    }

    async getHostServer() {
        const req = await undici(Endpoints.FindHostServer(), {
            method: "PUT",
            headers: {
                "accept": "application/json",
                "authorization": "Bearer "
            }
        });

        if (req.statusCode < 200 || req.statusCode >= 300) {
            throw new Error("Request to get game token was not successful");
        }

        const json = await req.body.json() as FindHostServerResponseBody;

        return {
            ip: intToIpAddress(json.Ip),
            port: json.Port
        };
    }

    async getToken(token: string, productUserId: string, username: string, clientVersion: VersionInfo, language: Language) {
        const req = await undici("https://matchmaker.among.us" + Endpoints.GetToken(), {
            method: "POST",
            body: JSON.stringify({
                Puid: productUserId,
                Username: username,
                ClientVersion: clientVersion.encode(),
                Language: language
            }),
            headers: {
                "content-type": "application/json",
                authorization: "Bearer "
            }
        });

        if (req.statusCode < 200 || req.statusCode >= 300) {
            throw new Error("Request to get game token was not successful");
        }

        return await req.body.text();
    }

    async getGameList(mapBitfield: number, lang: GameKeyword, quickChat: QuickChatMode, platformFlags: number, numImpostors: number) {
        const req = await undici(Endpoints.RequestGameList(mapBitfield, lang, quickChat, platformFlags, numImpostors), {
            method: "GET",
            headers: {
                "content-type": "application/json",
                authorization: "Bearer "
            }
        });

        if (req.statusCode < 200 || req.statusCode >= 300) {
            throw new Error("Request to get game token was not successful");
        }

        const json = await req.body.json() as RequestGameListResponseBody;

        return json.map(gameListing =>
            ({
                ip: intToIpAddress(gameListing.IP),
                port: gameListing.Port,
                gameCode: gameListing.GameId,
                numPlayers: gameListing.MaxPlayers,
                age: gameListing.Age,
                map: gameListing.MapId,
                numImpostors: gameListing.NumImpostors,
                maxPlayers: gameListing.MaxPlayers,
                hostName: gameListing.HostName,
                platformName: gameListing.HostPlatformName,
                platform: gameListing.Platform
            })) as GameListing[];
    }
}
