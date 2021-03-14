import { HazelBuffer } from "@skeldjs/util";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { Hostable } from "../Hostable";

import { MessageTag, RpcTag, SpawnID } from "@skeldjs/constant";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface PlayerPhysicsData {}

export interface PlayerPhysicsEvents extends NetworkableEvents {
    /**
     * Emitted when a player enters a vent.
     */
    "player.entervent": {
        /**
         * The ID of the vent that the player entered.
         */
        ventid: number;
    };
    /**
     * Emitted when a player exits a vent.
     */
    "player.exitvent": {
        /**
         * The ID of the vent that the player exited.
         */
        ventid: number;
    };
}

/**
 * Represents a player object for handling vent entering and exiting.
 *
 * See {@link PlayerPhysicsEvents} for events to listen to.
 */
export class PlayerPhysics extends Networkable<PlayerPhysicsData, PlayerPhysicsEvents> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;

    static classname = "PlayerPhysics" as const;
    classname = "PlayerPhysics" as const;

    /**
     * The ID of the vent that the player is currently in.
     */
    vent: number;

    constructor(
        room: Hostable,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | PlayerPhysicsData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
    }

    private _enterVent(ventid: number) {
        this.vent = ventid;
        this.emit("player.entervent", ventid);
    }

    /**
     * Enter a vent.
     * @param ventid The ID of the vent to enter.
     * @example
	 *```typescript
     * client.me.physics.enterVent(PolusVent.Office);
     * ```
	 */
    enterVent(ventid: number) {
        this._enterVent(ventid);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.EnterVent,
            netid: this.netid,
            ventid,
        });
    }

    private _exitVent(ventid: number) {
        this.vent = null;
        this.emit("player.exitvent", ventid);
    }

    /**
     * Exit a vent (Does not have to be the same vent or in the same network as the vent you entered).
     * @param ventid The ID of the vent to exit.
     * @example
	 *```typescript
     * client.me.physics.enterVent(PolusVent.Office);
     * ```
	 */
    exitVent(ventid: number) {
        this._exitVent(ventid);

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.ExitVent,
            netid: this.netid,
            ventid,
        });
    }
}
