import { BasicEvent } from "@skeldjs/events";
import { AlterGameMessage } from "@skeldjs/protocol";

import { Hostable, PrivacyType } from "../../Hostable";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";

/**
 * Emitted when the privacy of the room is updated.
 */
export class RoomSetPrivacyEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, ProtocolEvent {
    static eventName = "room.setprivacy" as const;
    eventName = "room.setprivacy" as const;

    private _alteredPrivacy: PrivacyType;

    constructor(
        public readonly room: RoomType,
        public readonly message: AlterGameMessage|undefined,
        /**
         * The old privacy of the room.
         */
        public readonly oldPrivacy: PrivacyType,
        /**
         * The new privacy of the room.
         */
        public readonly newPrivacy: PrivacyType
    ) {
        super();

        this._alteredPrivacy = newPrivacy;
    }

    /**
     * The altered privacy to set the room to, if changed.
     */
    get alteredPrivacy() {
        return this._alteredPrivacy;
    }

    /**
     * Revert the room's privacy to its old privacy.
     */
    revert() {
        this.setPrivacy(this.oldPrivacy);
    }

    /**
     * Change the privacy that the room was set to.
     * @param privacy The privacy to set.
     */
    setPrivacy(privacy: PrivacyType) {
        this._alteredPrivacy = privacy;
    }
}
