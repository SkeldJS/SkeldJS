import { EventMapFromList } from "@skeldjs/events";
import { StatefulRoom } from "../../StatefulRoom";
import { GameLogicComponent } from "../GameLogicComponent";
import { BaseSystemMessage, BaseRpcMessage } from "@skeldjs/au-protocol";
import { HazelWriter, HazelReader } from "@skeldjs/hazel";

export type NormalUsablesLogicComponentEvents = EventMapFromList<[]>;

export class NormalUsablesLogicComponent<RoomType extends StatefulRoom> extends GameLogicComponent<NormalUsablesLogicComponentEvents, RoomType> {
    // No headless impl. required (LogicUsablesBasic.cs)

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
