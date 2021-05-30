import { CancelableEvent } from "@skeldjs/events";
import { ReportDeadBodyMessage } from "@skeldjs/protocol";

import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerReportDeadBodyEvent extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.reportbody" as const;
    eventName = "player.reportbody" as const;

    private _alteredBody: PlayerData|"emergency";

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: ReportDeadBodyMessage|undefined,
        public readonly body: PlayerData|"emergency"
    ) {
        super();

        this._alteredBody = body;
    }

    get alteredBody() {
        return this._alteredBody;
    }

    setEmergency() {
        return this.setBody("emergency");
    }

    setBody(body: PlayerData | "emergency") {
        this._alteredBody = body;
    }
}
