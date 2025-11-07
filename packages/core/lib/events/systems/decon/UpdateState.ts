import { RevertableEvent } from "@skeldjs/events";
import { DeconSystemDataMessage, DeconSystemMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../../StatefulRoom";
import { RoomEvent } from "../../RoomEvent";
import { DeconSystem } from "../../../systems";
import { DeconSystemEvent } from "./DeconSystemEvent";

export class DeconSystemUpdateStateEvent<RoomType extends StatefulRoom> extends RevertableEvent implements RoomEvent<RoomType>, DeconSystemEvent<RoomType> {
    static eventName = "systems.decon.updatestate" as const;
    eventName = "systems.decon.updatestate" as const;

    private _alteredState: number;

    constructor(
        public readonly system: DeconSystem<RoomType>,
        public readonly originMessage: DeconSystemDataMessage|DeconSystemMessage|null,
        public readonly oldState: number,
        public readonly newState: number,
    ) {
        super();

        this._alteredState = newState;
    }

    get room() {
        return this.system.room;
    }

    get shipStatus() {
        return this.system.shipStatus;
    }

    get alteredState() {
        return this._alteredState;
    }

    requestRevert() {
        this.setState(this.oldState);
    }

    setState(state: number) {
        this._alteredState = state;
    }
}
