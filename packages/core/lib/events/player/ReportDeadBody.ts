import { CancelableEvent } from "@skeldjs/events";
import { ReportDeadBodyMessage } from "@skeldjs/protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { RoomEvent } from "../RoomEvent";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player reports a dead body of a player, telling the host to
 * begin a meeting.
 *
 * This event is only emitted if the client is the host and doesn't guarantee
 * that a meeting has started, see {@link PlayerStartMeetingEvent} to listen for
 * a meeting actually being started, and regardless of whether the client is the
 * host or not.
 */
export class PlayerReportDeadBodyEvent<RoomType extends StatefulRoom = StatefulRoom> extends CancelableEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.reportbody" as const;
    eventName = "player.reportbody" as const;

    private _alteredBody: Player<RoomType> | "emergency";

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: ReportDeadBodyMessage | undefined,
        /**
         * The body that the player reported, or "emergency" if the player called
         * an emergency meeting.
         */
        public readonly body: Player<RoomType> | "emergency"
    ) {
        super();

        this._alteredBody = body;
    }

    /**
     * The altered body that will be reported instead, if changed.
     */
    get alteredBody() {
        return this._alteredBody;
    }

    /**
     * Set the report to be calling an emergency meeting.
     */
    setEmergency() {
        this.setBody("emergency");
    }

    /**
     * Change the body that will be reported.
     * @param body The body for the player to report.
     */
    setBody(body: Player<RoomType> | "emergency") {
        this._alteredBody = body;
    }
}
