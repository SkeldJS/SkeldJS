import { ExtractEventTypes } from "@skeldjs/events";
import { BaseSystemMessage, BaseRpcMessage } from "@skeldjs/protocol";
import { HazelWriter, HazelReader } from "@skeldjs/hazel";

import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekDangerLevelLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekDangerLevelLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekDangerLevelLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicHnSDangerLevel.cs)

    parseData(reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        void data;
    }

    createData(): BaseSystemMessage | undefined {
        return undefined;
    }

    async processFixedUpdate(deltaTime: number): Promise<void> {
        void deltaTime;
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
