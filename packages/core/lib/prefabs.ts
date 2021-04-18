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
} from "./component";

import { Networkable } from "./Networkable";

import { Hostable } from "./Hostable";

import { HazelBuffer } from "@skeldjs/util";

export const SpawnPrefabs: {
    new (
        room: Hostable,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | any
    ): Networkable;
}[][] = [
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
