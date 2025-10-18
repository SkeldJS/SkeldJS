import { ExtractEventTypes } from "@skeldjs/events";
import { BaseDataMessage } from "@skeldjs/protocol";
import { HazelReader } from "@skeldjs/hazel";

import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";

export type HideNSeekPingLogicComponentEvents = ExtractEventTypes<[]>;

export class HideNSeekPingLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<HideNSeekPingLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicPingsHnS.cs)

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
