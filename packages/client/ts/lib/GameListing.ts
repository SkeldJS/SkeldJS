import { MapID } from "@skeldjs/constant";
import { SkeldjsClient } from "./client";

/**
 * Represents a game listing when searching for games.
 */
export class GameListing {
    /**
     * @param client The client that instantiated this object.
     * @param ip The IP of the server that the room is hosted on.
     * @param port The port of the server that the room is hosted on.
     * @param code The code of the room.
     * @param name The name of the room. (Usually the room host's name).
     * @param num_players The number of players currently connected to the room.
     * @param age The age of the room in seconds.
     * @param map The map of the game.
     * @param impostors The number of impostors in the game.
     * @param max_players The max number of players for the room.
     */
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

    /**
     * Join the room directly from the game listing.
     * @param doSpawn Whether or not to spawn the player. If false, the client will be unaware of any existing objects in the game until {@link SkeldjsClient.spawnSelf} is called.
     * @returns The code of the room joined.
     * @example
	 *```typescript
     * // Search for games and join a random one.
     * const client = new SkeldjsClient("2021.3.5.0");

     * await client.connect("EU", "weakeyes");

     * const games = await client.findGames();
     * const game = games[Math.floor(Math.random() * games.length)];

     * const code = await game.join();;
     * ```
	 */
    async join(doSpawn: boolean = true) {
        if (this.ip !== this.client.ip || this.port !== this.client.port) {
            await this.client.connect(this.ip, this.client.username, this.port);
        }

        return await this.client.joinGame(this.code, doSpawn);
    }
}
