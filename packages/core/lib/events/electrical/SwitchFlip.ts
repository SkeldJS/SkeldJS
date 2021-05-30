import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { RoomEvent } from "../RoomEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { SwitchSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { ElectricalEvent } from "./ElectricalEvent";

export class ElectricalSwitchFlipEvent extends RevertableEvent implements RoomEvent, ElectricalEvent, ProtocolEvent {
    static eventName = "electrical.switchflip" as const;
    eventName = "electrical.switchflip" as const;

    private _alteredSwitchId: number;
    private _alteredFlipped: boolean;

    constructor(
        public readonly room: Hostable,
        public readonly switchsystem: SwitchSystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player: PlayerData|undefined,
        public readonly switchId: number,
        public readonly flipped: boolean
    ) {
        super();

        this._alteredSwitchId = switchId;
        this._alteredFlipped = flipped;
    }

    get alteredSwitchId() {
        return this._alteredSwitchId;
    }

    get alteredFlipped() {
        return this._alteredFlipped;
    }

    setSwitchId(switchId: number) {
        this._alteredSwitchId = switchId;
    }

    setFlipped(flipped: boolean) {
        this._alteredFlipped = flipped;
    }
}
