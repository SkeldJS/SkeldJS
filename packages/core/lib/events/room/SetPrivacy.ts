import { BasicEvent } from "@skeldjs/events";
import { AlterGameMessage } from "@skeldjs/protocol";

import { Hostable, PrivacyType } from "../../Hostable";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";

export class RoomSetPrivacyEvent extends BasicEvent implements RoomEvent, ProtocolEvent {
    static eventName = "room.setprivacy" as const;
    eventName = "room.setprivacy" as const;

    private _alteredPrivacy: PrivacyType;

    constructor(
        public readonly room: Hostable,
        public readonly message: AlterGameMessage|undefined,
        public readonly oldPrivacy: PrivacyType,
        public readonly newPrivacy: PrivacyType
    ) {
        super();

        this._alteredPrivacy = newPrivacy;
    }

    get alteredPrivacy() {
        return this._alteredPrivacy;
    }

    revert() {
        this.setPrivacy(this.oldPrivacy);
    }

    setPrivacy(privacy: PrivacyType) {
        this._alteredPrivacy = privacy;
    }
}
