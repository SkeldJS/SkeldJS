import { Platform } from "@skeldjs/constant";

export interface GameListingResponseBody {
    IP: number;
    Port: number;
    GameId: number;
    PlayerCount: number;
    HostName: string;
    HostPlatformName: string;
    Platform: Platform;
    Age: number;
    MaxPlayers: number;
    NumImpostors: number;
    MapId: number;
}

export type RequestGameListResponseBody = GameListingResponseBody[];
