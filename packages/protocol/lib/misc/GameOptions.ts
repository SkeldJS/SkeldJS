import {
    MapID,
    DistanceID,
    LanguageID,
    TaskBarUpdate,
} from "@skeldjs/constant";

export interface BaseGameOptions {
    version: number;
}

export interface GameOptionsV1 extends BaseGameOptions {
    version: 1;
    players: number;
    language: LanguageID;
    map: MapID;
    playerSpeed: number;
    crewmateVision: number;
    impostorVision: number;
    killCooldown: number;
    commonTasks: number;
    longTasks: number;
    shortTasks: number;
    emergencies: number;
    impostors: number;
    killDistance: DistanceID;
    discussionTime: number;
    votingTime: number;
    isDefaults: boolean;
}

export interface GameOptionsV2 extends Omit<GameOptionsV1, "version"> {
    version: 2;
    emergencyCooldown: number;
}

export interface GameOptionsV3 extends Omit<GameOptionsV2, "version"> {
    version: 3;
    confirmEjects: boolean;
    visualTasks: boolean;
}

export interface GameOptionsV4 extends Omit<GameOptionsV3, "version"> {
    version: 4;
    anonymousVotes: boolean;
    taskbarUpdates: TaskBarUpdate;
}

export type GameOptions =
    | GameOptionsV1
    | GameOptionsV2
    | GameOptionsV3
    | GameOptionsV4;
