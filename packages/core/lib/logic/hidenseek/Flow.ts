import { ExtractEventTypes } from "@skeldjs/events";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Hostable } from "../../Hostable";
import { InnerGameManager } from "../../objects";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekFlowLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekFlowLogicComponent<RoomType extends Hostable = Hostable> extends GameLogicComponent<HideNSeekFlowLogicComponentEvents, RoomType> {
    currentHideTime: number;
    currentFinalHideTime: number;

    constructor(manager: InnerGameManager<RoomType>) {
        super(manager);

        this.currentHideTime = 10000;
        this.currentFinalHideTime = 10000;
    }

    get isInFinalCountdown() {
        return this.currentHideTime <= 0;
    }

    FixedUpdate(deltaTime: number) {

    }

    Deserialize(reader: HazelReader, initialState: boolean) {
        const nextCurrentHideTime = reader.float();
        this.currentFinalHideTime = reader.float();
        if (nextCurrentHideTime <= 0 && this.currentFinalHideTime >= 0) {
            // TODO: emit event that final hide time has started
        }
        this.currentHideTime = nextCurrentHideTime;
    }

    Serialize(writer: HazelWriter, initialState: boolean) {
        writer.float(this.currentHideTime);
        writer.float(this.currentFinalHideTime);
    }
}
