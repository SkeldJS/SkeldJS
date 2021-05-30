import { RevertableEvent } from "@skeldjs/events";
import { CastVoteMessage } from "@skeldjs/protocol";

import { MeetingHud } from "../../component";
import { Hostable } from "../../Hostable";
import { PlayerVoteState } from "../../misc/PlayerVoteState";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MeetingHudEvent } from "./MeetingHudEvent";

export class MeetingHudVoteCastEvent extends RevertableEvent implements RoomEvent, MeetingHudEvent, ProtocolEvent {
    static eventName = "meetinghud.votecast" as const;
    eventName = "meetinghud.votecast" as const;

    private _alteredVoter: PlayerVoteState;
    private _alteredSuspect: PlayerData|undefined;

    constructor(
        public readonly room: Hostable,
        public readonly meetinghud: MeetingHud,
        public readonly message: CastVoteMessage|undefined,
        public readonly voter: PlayerVoteState,
        public readonly suspect: PlayerData|undefined
    ) {
        super();

        this._alteredVoter = voter;
        this._alteredSuspect = suspect;
    }

    get didSkip() {
        return this._alteredSuspect === undefined;
    }

    get alteredVoter() {
        return this._alteredVoter;
    }

    get alteredSuspect() {
        return this._alteredSuspect;
    }

    setVoter(voter: PlayerVoteState) {
        this._alteredVoter = voter;
    }

    setSuspect(suspect: PlayerData) {
        this._alteredSuspect = suspect;
    }
}
