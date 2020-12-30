import { PlayerGameData } from "@skeldjs/types"

import { Heritable } from "./Heritable";

import { GameData } from "./component/GameData";
import { LobbyBehaviour } from "./component/LobbyBehaviour";
import { MeetingHud } from "./component/MeetingHud";
import { ShipStatus } from "./component/ShipStatus";
import { VoteBanSystem } from "./component/VoteBanSystem";

import { Room } from "./Room";

export interface Global {}

export class Global extends Heritable {
    constructor(room: Room) {
        super(room, -2);
    }

    get shipstatus() {
        return this.getComponent(ShipStatus);
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