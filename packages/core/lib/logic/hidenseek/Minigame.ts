import { ExtractEventTypes } from "@skeldjs/events";
import { HazelReader } from "@skeldjs/hazel";
import { BaseDataMessage, BaseRpcMessage } from "@skeldjs/protocol";

import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekMinigameLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekMinigameLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekMinigameLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMinigameHnS.cs)
    
    parseData(reader: HazelReader): BaseDataMessage | undefined {
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        void data;
    }

    createData(): BaseDataMessage | undefined {
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
