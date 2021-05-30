import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MedScanSystem } from "../../system";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { MedScanEvent } from "./MedScanEvent";

export class MedScanLeaveQueueEvent extends RevertableEvent implements RoomEvent, MedScanEvent, ProtocolEvent {
    static eventName = "medscan.leavequeue" as const;
    eventName = "medscan.leavequeue" as const;

    private _alteredPlayer: PlayerData;

    constructor(
        public readonly room: Hostable,
        public readonly medscan: MedScanSystem,
        public readonly message: RepairSystemMessage|undefined,
        public readonly player: PlayerData
    ) {
        super();

        this._alteredPlayer = player;
    }

    get alteredPlayer() {
        return this._alteredPlayer;
    }

    setPlayer(player: PlayerData) {
        this._alteredPlayer = player;
    }
}
