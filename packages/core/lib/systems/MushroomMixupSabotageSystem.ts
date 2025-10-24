import { BaseSystemMessage } from "@skeldjs/protocol";
import { HazelReader } from "@skeldjs/hazel";
import { SystemStatus } from "./SystemStatus";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";

export class MushroomMixupSabotageSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType> {
    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        void data;
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        void player, message;
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        void deltaSeconds;
    }
}