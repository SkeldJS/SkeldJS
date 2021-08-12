import {
    AirshipStatus,
    AprilShipStatus,
    CustomNetworkTransform,
    GameData,
    MiraShipStatus,
    LobbyBehaviour,
    MeetingHud,
    PolusShipStatus,
    PlayerControl,
    PlayerPhysics,
    SkeldShipStatus,
    VoteBanSystem,
} from "./objects";

import { NetworkableConstructor } from "./Heritable";

export const SpawnPrefabs: NetworkableConstructor<any>[][] = [
    [SkeldShipStatus],
    [MeetingHud],
    [LobbyBehaviour],
    [GameData, VoteBanSystem],
    [PlayerControl, PlayerPhysics, CustomNetworkTransform],
    [MiraShipStatus],
    [PolusShipStatus],
    [AprilShipStatus],
    [AirshipStatus],
];
