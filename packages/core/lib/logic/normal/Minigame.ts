import { EventMapFromList } from "@skeldjs/events";
import { BaseSystemMessage, BaseRpcMessage } from "@skeldjs/au-protocol";
import { HazelWriter, HazelReader } from "@skeldjs/hazel";

import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type NormalMinigameLogicComponentEvents = EventMapFromList<[]>;

export class NormalMinigameLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<NormalMinigameLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMinigame.cs, no file for normal gamemode logic)
    
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
