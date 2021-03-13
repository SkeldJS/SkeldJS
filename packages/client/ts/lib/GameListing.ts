import { MapID } from "@skeldjs/constant";
import { SkeldjsClient } from "./client";

export class GameListing {
    constructor(
        private client: SkeldjsClient,
        public readonly ip: string,
        public readonly port: number,
        public readonly code: number,
        public readonly name: string,
        public readonly num_players: number,
        public readonly age: number,
        public readonly map: MapID,
        public readonly impostors: number,
        public readonly max_players: number
    ) {}

    async join(doSpawn: boolean = true) {
        if (this.ip !== this.client.ip || this.port !== this.client.port) {
            await this.client.connect(this.ip, this.client.username, this.port);
        }

        return await this.client.joinGame(this.code, doSpawn);
    }
}
