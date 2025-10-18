import { ExtractEventTypes } from "@skeldjs/events";
import { BaseDataMessage, BaseRpcMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";

import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekMusicLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekMusicLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekMusicLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicMusicHnS.cs)
    
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
