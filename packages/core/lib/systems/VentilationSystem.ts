import { RepairSystemMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Player } from "../Player";
import { SystemStatus } from "./SystemStatus";
import { StatefulRoom } from "../StatefulRoom";

export class VentilationSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType> {
    deserializeFromReader(reader: HazelReader, spawn: boolean): void {
        void reader, spawn;
    }

    serializeToWriter(writer: HazelWriter, spawn: boolean): void {
        void writer, spawn;
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