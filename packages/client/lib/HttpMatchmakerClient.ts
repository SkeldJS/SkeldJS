import fetch from "node-fetch";
import { GameListing, PlatformSpecificData } from "@skeldjs/protocol";
import { SkeldjsClient } from "./client";
import { Language } from "@skeldjs/constant";

export interface HostServerResponse {
    IP: number;
    Port: number;
}

export interface GameListingResponse {
    IP: number;
    Port: number;
    GameId: number;
    HostName: string;
    PlayerCount: number;
    Age: number;
    MapId: number;
    NumImpostors: number;
    MaxPlayers: number;
    Platform: number;
    HostPlatformName: string;
    Language: number;
}

export class HttpMatchmakerClient {
    public matchmakerToken?: string;

    hostname?: string;
    port?: number;

    constructor(protected readonly client: SkeldjsClient) {}

    async login() {
        if (!this.hostname)
            throw new Error("No hostname; cannot login");

        const res = await fetch(`${this.hostname}:${this.port}/api/user`, {
            method: "POST",
            headers: [ [ "Content-Type", "application/json" ], [ "Authorization", "Bearer " + this.client.config.idToken ] ],
            body: JSON.stringify({
                Puid: this.client.config.eosProductUserId,
                Username: this.client.username,
                ClientVersion: this.client.version.encode(),
                Language: this.client.config.language
            })
        });

        if (!res.ok) {
            throw new Error(`Invalid response @ POST ${this.hostname}:${this.port}/api/user: ${res.status}`);
        }

        this.matchmakerToken = await res.text();
        return this.matchmakerToken;
    }

    ipIntToString(ip: number) {
        const arrayBuffer = new ArrayBuffer(4);
        const dataView = new DataView(arrayBuffer);
        dataView.setInt32(0, ip, true);

        const uint8Array = new Uint8Array(arrayBuffer);

        return uint8Array[0].toString() + "."
            + uint8Array[1].toString() + "."
            + uint8Array[2].toString() + "."
            + uint8Array[3];
    }

    async getIpToHostGame() {
        if (!this.matchmakerToken)
            throw new Error("Not logged in, use .login()");

        const res = await fetch(`${this.hostname}:${this.port}/api/games`, {
            method: "PUT",
            headers: [ [ "Authorization", "Bearer " + this.matchmakerToken ] ]
        });

        if (!res.ok) {
            throw new Error(`Invalid response @ PUT ${this.hostname}:${this.port}/api/games: ${res.status}`);
        }

        const { IP, Port } = await res.json() as HostServerResponse;
        const ip = this.ipIntToString(IP);

        return { ip, port: Port };
    }

    async getIpToJoinGame(gameCode: number) {
        if (!this.matchmakerToken)
            throw new Error("Not logged in, use .login()");

        const res = await fetch(`${this.hostname}:${this.port}/api/games?gameId=${gameCode}`, {
            method: "POST",
            headers: [ [ "Authorization", "Bearer " + this.matchmakerToken ] ]
        });

        if (!res.ok) {
            throw new Error(`Invalid response @ POST ${this.hostname}:${this.port}/api/games: ${res.status}`);
        }

        const { IP, Port } = await res.json() as HostServerResponse;

        const ip = this.ipIntToString(IP);

        return { ip, port: Port };
    }

    async findGames(mapId: number, lang: number, quickChat: number, platformFlags: number, numImpostors: number) {
        if (!this.matchmakerToken)
            throw new Error("Not logged in, use .login()");

        const res = await fetch(`${this.hostname}:${this.port}/api/games?mapId=${mapId}&lang=${lang}&quickChat=${quickChat}&platformFlags=${platformFlags}&numImpostors=${numImpostors}`, {
            method: "POST",
            headers: [ [ "Authorization", "Bearer " + this.matchmakerToken ] ]
        });

        if (!res.ok) {
            throw new Error(`Invalid response @ POST ${this.hostname}:${this.port}/api/games: ${res.status}`);
        }

        const gameListings = await res.json() as GameListingResponse[];

        return gameListings.map(listing => {
            return new GameListing(
                listing.GameId,
                this.ipIntToString(listing.IP),
                listing.Port,
                listing.HostName,
                listing.PlayerCount,
                listing.Age,
                listing.MapId,
                listing.NumImpostors,
                listing.MaxPlayers,
                new PlatformSpecificData(listing.Platform, listing.HostPlatformName)
            );
        });
    }

    async getServerGameTags(language: Language) {
        const res = await fetch(`${this.hostname}:${this.port}/api/filtertags?lang=${language}`, {
            method: "GET",
            headers: [ [ "Authorization", "Bearer " + this.matchmakerToken ]]
        });

        if (!res.ok) {
            throw new Error(`Invalid response @ GET ${this.hostname}:${this.port}/api/filtertags: ${res.status}`);
        }

        return await res.json() as string[];
    }
}
