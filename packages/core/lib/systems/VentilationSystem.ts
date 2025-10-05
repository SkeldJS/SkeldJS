import { RepairSystemMessage } from "@skeldjs/protocol";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { Player } from "../Player";
import { SystemStatus } from "./SystemStatus";

export class VentilationSystem extends SystemStatus {
    deserializeFromReader(reader: HazelReader, spawn: boolean): void {
        void reader, spawn;
    }

    serializeToWriter(writer: HazelWriter, spawn: boolean): void {
        void writer, spawn;
    }

    async handleRepairByPlayer(player: Player | undefined, amount: number, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, amount, rpc;
    }

    async handleSabotageByPlayer(player: Player | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, rpc;
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async fullyRepairHost(): Promise<void> {
        void 0;
    }

    async fullyRepairPlayer(player: Player | undefined): Promise<void> {
        void player;
    }

    async sendFullRepair(player: Player): Promise<void> {
        void player;
    }
}