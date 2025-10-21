import { ExtractEventTypes } from "@skeldjs/events";
import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, BaseRpcMessage } from "@skeldjs/protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekMinigameLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekMinigameLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekMinigameLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMinigameHnS.cs)
    
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
