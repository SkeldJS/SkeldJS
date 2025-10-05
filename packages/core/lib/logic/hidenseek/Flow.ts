import { ExtractEventTypes } from "@skeldjs/events";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { StatefulRoom } from "../../StatefulRoom";
import { InnerGameManager } from "../../objects";
import { GameLogicComponent } from "../GameLogicComponent";
import { BaseRpcMessage } from "@skeldjs/protocol";

export type HideNSeekFlowLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekFlowLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekFlowLogicComponentEvents, RoomType> {
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

    async processFixedUpdate(deltaTime: number): Promise<void> {
        void deltaTime;
    }

    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        void rpc;
    }

    deserializeFromReader(reader: HazelReader, initialState: boolean) {
        const nextCurrentHideTime = reader.float();
        this.currentFinalHideTime = reader.float();
        if (nextCurrentHideTime <= 0 && this.currentFinalHideTime >= 0) {
            // TODO: emit event that final hide time has started
        }
        this.currentHideTime = nextCurrentHideTime;
    }

    serializeToWriter(writer: HazelWriter, initialState: boolean) {
        writer.float(this.currentHideTime);
        writer.float(this.currentFinalHideTime);
    }

    async onGameStart(): Promise<void> {
        void 0;
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
