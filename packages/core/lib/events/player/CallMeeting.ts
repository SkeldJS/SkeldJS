import { PlayerEvent } from "./PlayerEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";

export class PlayerCallMeetingEvent extends PlayerEvent {
    static eventName = "player.callmeeting" as const;
    eventName = "player.callmeeting" as const;

    emergency: boolean;
    body?: PlayerData;

    constructor(
        room: Hostable<any>,
        player: PlayerData,
        emergency: boolean,
        body?: PlayerData
    ) {
        super(room, player);

        this.emergency = emergency;
        this.body = body;
    }
}
