import { TypedEvents } from "@skeldjs/util";

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

export type GlobalEvents = {

};

// eslint-disable-next-line @typescript-eslint/ban-types
export class Global<T extends TypedEvents = {}> extends Heritable<GlobalEvents & T> {
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
