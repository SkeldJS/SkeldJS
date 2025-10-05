import { ExtractEventTypes } from "@skeldjs/events";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekDeathPopupLevelLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekDeathPopupLevelLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekDeathPopupLevelLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicHnSDeathPopup.cs)

    async processFixedUpdate(deltaTime: number): Promise<void> {
        void deltaTime;
    }

    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        void rpc;
    }

    serializeToWriter(writer: HazelWriter, initialState: boolean): void {
        void writer, initialState;
    }

    deserializeFromReader(reader: HazelReader, initialState: boolean): void {
        void reader, initialState;
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
