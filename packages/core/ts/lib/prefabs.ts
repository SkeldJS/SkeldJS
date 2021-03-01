import {
    Airship,
    AprilShipStatus,
    CustomNetworkTransform,
    GameData,
    Headquarters,
    LobbyBehaviour,
    MeetingHud,
    PlanetMap,
    PlayerControl,
    PlayerPhysics,
    ShipStatus,
    VoteBanSystem
} from "./component"

import { Networkable } from "./Networkable"

import { Hostable } from "./Hostable"

import { HazelBuffer } from "@skeldjs/util"

export const SpawnPrefabs: ({ new(room: Hostable, netid: number, ownerid: number, data?: HazelBuffer|any): Networkable })[][] = [
    [ ShipStatus ],
    [ MeetingHud ],
    [ LobbyBehaviour ],
    [ GameData, VoteBanSystem ],
    [ PlayerControl, PlayerPhysics, CustomNetworkTransform ],
    [ Headquarters ],
    [ PlanetMap ],
    [ AprilShipStatus ],
    [ Airship ]
];
