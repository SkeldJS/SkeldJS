import { HazelBuffer } from "@skeldjs/util";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { Hostable } from "../Hostable";

import { MessageTag, RpcTag, SpawnID } from "@skeldjs/constant";
import { RpcMessage } from "@skeldjs/protocol";
import { NetworkUtils } from "../utils/net";

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
    /**
     * Emitted when a player uses a ladder.
     */
    "player.climbladder": {
        /**
         * The ID of the ladder that the player climbed.
         */
        ladderId: number;
    };
}

/**
 * Represents a player object for handling vent entering and exiting.
 *
 * See {@link PlayerPhysicsEvents} for events to listen to.
 */
export class PlayerPhysics extends Networkable<
    PlayerPhysicsData,
    PlayerPhysicsEvents
> {
    static type = SpawnID.Player as const;
    type = SpawnID.Player as const;

    static classname = "PlayerPhysics" as const;
    classname = "PlayerPhysics" as const;

    /**
     * The ID of the vent that the player is currently in.
     */
    vent: number;

    private ladderClimbSeqId: number;

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

    HandleRpc(message: RpcMessage) {
        switch (message.rpcid) {
            case RpcTag.EnterVent:
                this._enterVent(message.ventid);
                break;
            case RpcTag.ExitVent:
                this._exitVent(message.ventid);
                break;
            case RpcTag.ClimbLadder:
                const seqId = message.seqId;
                if (
                    NetworkUtils.seqIdGreaterThan(seqId, this.ladderClimbSeqId, 1)
                ) {
                    this.ladderClimbSeqId = seqId;
                    this._climbLadder(message.ladderId);
                }
                break;
        }
    }

    private _enterVent(ventid: number) {
        this.vent = ventid;
        this.emit("player.entervent", { ventid });
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
        this.emit("player.exitvent", { ventid });
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

    private _climbLadder(ladderId: number) {
        this.emit("player.climbladder", { ladderId });
    }

    climbLadder(ladderId: number) {
        this._climbLadder(ladderId);

        this.ladderClimbSeqId++;
        if (this.ladderClimbSeqId > 255) this.ladderClimbSeqId = 0;

        this.room.stream.push({
            tag: MessageTag.RPC,
            rpcid: RpcTag.ClimbLadder,
            netid: this.netid,
            seqId: this.ladderClimbSeqId,
            ladderId,
        });
    }
}
