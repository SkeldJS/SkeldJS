import { ExtractEventTypes } from "@skeldjs/events";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage, BaseRpcMessage, FlowLogicComponentDataMessage } from "@skeldjs/protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { InnerGameManager } from "../../objects";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekFlowLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekFlowLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekFlowLogicComponentEvents, RoomType> {
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

    parseData(reader: HazelReader): BaseSystemMessage | undefined {
        return FlowLogicComponentDataMessage.deserializeFromReader(reader);
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof FlowLogicComponentDataMessage) {
            this.currentHideTime = data.hideTime;
            this.currentFinalHideTime = data.finalHideTime;
            // TODO: emit event that final hide time has started
        }
    }

    createData(): BaseSystemMessage | undefined {
        return new FlowLogicComponentDataMessage(this.currentHideTime, this.currentFinalHideTime);
    }

    async processFixedUpdate(deltaTime: number): Promise<void> {
        // TODO: process countdown
    }

    async onGameStart(): Promise<void> {
        this.currentHideTime = this.manager.room.settings.hidingTime;
        this.currentFinalHideTime = this.manager.room.settings.finalHideTime;
        this.isDirty = true;
    }

    async onGameEnd(): Promise<void> {
        void 0;
    }

    async onDestroy(): Promise<void> {
        void 0;
    }

    async onPlayerDisconnect(): Promise<void> {
        void 0;
    }
}
