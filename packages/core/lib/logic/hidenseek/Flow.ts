import { EventMapFromList } from "@skeldjs/events";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { BaseSystemMessage, BaseRpcMessage, FlowLogicComponentDataMessage } from "@skeldjs/au-protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { GameManager } from "../../objects";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekFlowLogicComponentEvents = EventMapFromList<[]>;

export class HideNSeekFlowLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekFlowLogicComponentEvents, RoomType> {
    currentHideTime: number;
    currentFinalHideTime: number;

    /**
     * Whether the final hide phase has started in this game.
     */
    finalHideStarted: boolean = false;

    /**
     * Whether the hiding timer has expired and seeking has begun.
     */
    seekingStarted: boolean = false;

    constructor(manager: GameManager<RoomType>) {
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
            const wasHiding = this.currentHideTime > 0;
            this.currentHideTime = data.hideTime;
            this.currentFinalHideTime = data.finalHideTime;

            // Detect phase transitions
            if (wasHiding && this.currentHideTime <= 0) {
                this.seekingStarted = true;
            }
            if (this.isInFinalCountdown && !this.finalHideStarted) {
                this.finalHideStarted = true;
            }
        }
    }

    createData(): BaseSystemMessage | undefined {
        return new FlowLogicComponentDataMessage(this.currentHideTime, this.currentFinalHideTime);
    }

    async processFixedUpdate(deltaTime: number): Promise<void> {
        // Process hide time countdown
        if (this.currentHideTime > 0) {
            const wasHiding = this.currentHideTime > 0;
            this.currentHideTime = Math.max(0, this.currentHideTime - deltaTime);
            if (wasHiding && this.currentHideTime <= 0) {
                this.seekingStarted = true;
            }
            this.isDirty = true;
        }

        // Process final hide time countdown
        if (this.isInFinalCountdown && this.currentFinalHideTime > 0) {
            const wasFinal = this.finalHideStarted;
            this.currentFinalHideTime = Math.max(0, this.currentFinalHideTime - deltaTime);
            if (!wasFinal) {
                this.finalHideStarted = true;
            }
            this.isDirty = true;
        }
    }

    async onGameStart(): Promise<void> {
        this.currentHideTime = this.manager.room.settings.hidingTime;
        this.currentFinalHideTime = this.manager.room.settings.finalHideTime;
        this.seekingStarted = false;
        this.finalHideStarted = false;
        this.isDirty = true;
    }

    async onGameEnd(): Promise<void> {
        this.seekingStarted = false;
        this.finalHideStarted = false;
    }

    async onDestroy(): Promise<void> {
        this.seekingStarted = false;
        this.finalHideStarted = false;
    }

    async onPlayerDisconnect(): Promise<void> {
        this.isDirty = true;
    }
}
