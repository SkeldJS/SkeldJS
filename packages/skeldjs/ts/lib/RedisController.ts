import { Tedis } from "tedis";

import { SkeldjsServer } from "@skeldjs/server";

interface RoomInfo {
    code: number;
    name: string;
    players: number;
    max_players: number;
    port: number;
    host: string;
}

export class RedisController {
    client: Tedis;

    constructor(
        private server: SkeldjsServer,
        port: number,
        host: string,
        password: string = ""
    ) {
        this.client = new Tedis({
            port,
            host,
            password,
        });
    }

    async roomExists(code: number) {
        return (await this.client.exists(code.toString())) === 1;
    }

    async createRoom(code: number, max_players: number) {
        const room: RoomInfo = {
            code,
            max_players,
            name: "",
            players: 0,
            port: this.server.config.port,
            host: null,
        };

        return (
            (await this.client.hmset(room.code.toString(), room as any)) ===
            "OK"
        );
    }

    async setRoomName(code: number, name: string) {
        return (await this.client.hset(code.toString(), "name", name)) === 1;
    }

    async setRoomPlayers(code: number, players: number) {
        return (
            (await this.client.hset(code.toString(), "players", players)) === 1
        );
    }

    async setRoomMaxPlayers(code: number, max_players: number) {
        return (
            (await this.client.hset(
                code.toString(),
                "max_players",
                max_players
            )) === 1
        );
    }

    async getRoom(code: number) {
        const room = await this.client.hgetall(code.toString());

        if (Object.keys(room).length === 0) return null;

        return (room as unknown) as RoomInfo;
    }

    async destroyRoom(code: number) {
        return (await this.client.del(code.toString())) > 0;
    }
}
