import { RevertableEvent } from "@skeldjs/events";
import { CastVoteMessage } from "@skeldjs/protocol";

import { MeetingHud } from "../../objects";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

/**
 * Emitted when a player casts a vote on another player or skips vote in a
 * meeting.
 */
export class MeetingHudVoteCastEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, MeetingHudEvent, ProtocolEvent {
    static eventName = "meeting.castvote" as const;
    eventName = "meeting.castvote" as const;

    private _alteredVoter: PlayerData<RoomType>;
    private _alteredSuspect: PlayerData<RoomType>|undefined;

    constructor(
        public readonly room: RoomType,
        public readonly meetinghud: MeetingHud<RoomType>,
        public readonly message: CastVoteMessage|undefined,
        /**
         * The player that cast the vote.
         */
        public readonly voter: PlayerData<RoomType>,
        /**
         * The player that the voter voted for.
         */
        public readonly suspect: PlayerData<RoomType>|undefined
    ) {
        super();

        this._alteredVoter = voter;
        this._alteredSuspect = suspect;
    }

    /**
     * Whether the voter skipped the vote.
     */
    get didSkip() {
        return this._alteredSuspect === undefined;
    }

    /**
     * The altered player that will cast the vote instead, if changed.
     */
    get alteredVoter() {
        return this._alteredVoter;
    }

    /**
     * The altered player that the voter voted for instead, if changed.
     */
    get alteredSuspect() {
        return this._alteredSuspect;
    }

    /**
     * Change the player that cast the vote.
     * @param voter The player to cast the vote.
     */
    setVoter(voter: PlayerData<RoomType>) {
        this._alteredVoter = voter;
    }

    /**
     * Change the player that the voter voted for.
     * @param suspect The player for the voter to vote for.
     */
    setSuspect(suspect: PlayerData<RoomType>) {
        this._alteredSuspect = suspect;
    }
}
