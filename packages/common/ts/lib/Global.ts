import { Heritable } from "./Heritable";

import {
    Airship,
    AprilShipStatus,
    GameData,
    Headquarters,
    LobbyBehaviour,
    MeetingHud,
    PlanetMap,
    ShipStatus,
    VoteBanSystem
} from "./component";

import { Room } from "./Room";

export interface Global {}

export class Global extends Heritable {
    constructor(room: Room) {
        super(room, -2);
    }

    get shipstatus() {
        return this.getComponent<ShipStatus|Headquarters|PlanetMap|AprilShipStatus|Airship>([ ShipStatus, Headquarters, PlanetMap, AprilShipStatus, Airship ]);
    }

    get meetinghud() {
        return this.getComponent(MeetingHud);
    }

    get lobbybehaviour() {
        return this.getComponent(LobbyBehaviour);
    }

    get gamedata() {
        return this.getComponent(GameData);
    }

    get votebansystem() {
        return this.getComponent(VoteBanSystem);
    }
}