import dgram from "dgram";

import { EventEmitter, ExtractEventTypes } from "@skeldjs/events";
import { DiscoveryFoundGameEvent } from "./events";

const sleep = (n: number) => new Promise(res => setTimeout(res, n));

export type LanDiscoveryEvents = ExtractEventTypes<[
    DiscoveryFoundGameEvent
]>;

/**
 * Represents the LAN searching for games area in Among Us.
 * 
 * Binds a UDP socket to 47777 and waits for messages containing a game name
 * and the number of players in the game.
 * 
 * Prevents duplicate games from repeated broadcast messages.
 * 
 * See {@link LanDiscoveryEvents} for events to listen to.
 * @example
 * ```ts
 * (async () => {
 *   const lanDiscovery = new LanDiscovery;
 *   const client = new SkeldjsClient("2021.4.25");
 *
 *   client.on("client.disconnect", disconnect => {
 *     console.log("Client disconnected: %s", DisconnectReason[disconnect.reason]);
 *   });
 * 
 *   lanDiscovery.begin();
 *   const foundGame = await lanDiscovery.wait("discovery.foundgame");
 *
 *   await client.connect(foundGame.ip, "weakeyes");
 *
 *   await client.joinGame(foundGame.gameCode);
 *
 *   await client.me?.control?.setName("weakeyes");
 *   await client.me?.control?.setColor(Color.Blue);
 * })();
 * ```
 */
export class LanDiscovery extends EventEmitter<LanDiscoveryEvents> {
    /**
     * All games that have been found so far, cleared on {@link LanDiscovery.begin}.
     */
    foundGames: DiscoveryFoundGameEvent[];

    /**
     * The UDP socket used.
     */
    socket?: dgram.Socket;

    constructor() {
        super();

        this.foundGames = [];
    }

    /**
     * Start listening for games hosted locally, binds to 47777. Clears the
     * {@link LanDiscovery.foundGames} array.
     * @example
     * const lanDiscovery = new LanDiscovery;
     * 
     * lanDiscovery.begin();
     *
     * lanDiscovery.on("discovery.foundgame", foundGame => {
     *   console.log(`Found game: ${foundGame.name} at ${foundGame.ip}:${foundGame.port}`);
     * });
     */
    async begin() {
        this.foundGames = [];
        this.socket = dgram.createSocket("udp4");
        this.socket.bind(47777);
        this.socket.on("message", this.onMessage.bind(this));
    }

    /**
     * Stops listening for games, does not clear {@link LanDiscovery.foundGames}.
     */
    async end() {
        this.socket?.close();
        this.socket?.removeAllListeners();
    }

    async onMessage(buffer: Buffer, rinfo: dgram.RemoteInfo) {
        const str = buffer.toString("utf8");
        const [ playerName, , playerCountStr ] = str.split("~");
        const playerCount = parseInt(playerCountStr);

        if (!isNaN(playerCount)) {
            for (const foundGame of this.foundGames) { // prevent duplicates
                if (
                    foundGame.ip === rinfo.address &&
                    foundGame.port === rinfo.port &&
                    foundGame.name === playerName
                ) {
                    return;
                }
            }

            const foundGame = new DiscoveryFoundGameEvent(
                rinfo.address,
                rinfo.port,
                playerName,
                playerCount
            );

            this.foundGames.push(foundGame);

            this.emit(foundGame);
        }
    }

    /**
     * Search for games for a specified amount of time. Clears the current {@link LanDiscovery.foundGames} array.
     * 
     * Properly cleans up with {@link LanDiscovery.end} afterwards.
     * @param numSeconds The number of seconds to search for games for.
     * @returns The games that were found.
     * @example
     * ```ts
     * const lanDiscovery = new LanDiscovery;
     * const games = await lanDiscovery.searchFor(5); // search for 5 seconds.
     * 
     * console.log(games); // => [ DiscoveryFoundGameEvent, DiscoveryFoundGameEvent, ...]
     * ```
     */
    async searchFor(numSeconds: number) {
        await this.begin();
        await sleep(numSeconds * 1000);
        await this.end();
        return this.foundGames;
    }
}