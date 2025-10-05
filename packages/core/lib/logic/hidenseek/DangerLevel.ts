import { ExtractEventTypes } from "@skeldjs/events";
import { BaseRpcMessage } from "@skeldjs/protocol";
import { HazelWriter, HazelReader } from "@skeldjs/util";

import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekDangerLevelLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekDangerLevelLogicComponent<RoomType extends StatefulRoom = StatefulRoom> extends GameLogicComponent<HideNSeekDangerLevelLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicHnSDangerLevel.cs)

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
