import { BaseDataMessage, RepairSystemMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { Player } from "../Player";
import { SystemStatus } from "./SystemStatus";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";

export class VentilationSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType> {
    parseData(dataState: DataState, reader: HazelReader): BaseDataMessage | undefined {
        throw new Error("Method not implemented.");
    }

    handleData(data: BaseDataMessage): Promise<void> {
        throw new Error("Method not implemented.");
    }

    createData(dataState: DataState): BaseDataMessage | undefined {
        throw new Error("Method not implemented.");
    }

    async handleRepairByPlayer(player: Player<RoomType> | undefined, amount: number, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, amount, rpc;
    }

    async handleSabotageByPlayer(player: Player<RoomType> | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, rpc;
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async fullyRepairHost(): Promise<void> {
        void 0;
    }

    async fullyRepairPlayer(player: Player<RoomType> | undefined): Promise<void> {
        void player;
    }

    async sendFullRepair(player: Player<RoomType>): Promise<void> {
        void player;
    }
}