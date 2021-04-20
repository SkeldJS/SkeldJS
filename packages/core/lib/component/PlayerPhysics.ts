import { HazelBuffer, HazelReader, HazelWriter } from "@skeldjs/util";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";
import { RpcMessage } from "@skeldjs/protocol";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { Hostable } from "../Hostable";

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
    static type = SpawnType.Player as const;
    type = SpawnType.Player as const;

    static classname = "PlayerPhysics" as const;
    classname = "PlayerPhysics" as const;

    /**
     * The ID of the vent that the player is currently in.
     */
    vent: number;

    private ladderClimbSeqId: number;

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelBuffer | PlayerPhysicsData
    ) {
        super(room, netid, ownerid, data);
    }

    get owner() {
        return super.owner as PlayerData;
    }

    HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.EnterVent:
                const ventid = reader.upacked();
                this._enterVent(ventid);
                break;
            case RpcMessageTag.ExitVent: {
                const ventid = reader.upacked();
                this._exitVent(ventid);
                break;
            }
            case RpcMessageTag.ClimbLadder:
                const ladderId = reader.uint8();
                const seqId = reader.uint8();
                if (
                    NetworkUtils.seqIdGreaterThan(
                        seqId,
                        this.ladderClimbSeqId,
                        1
                    )
                ) {
                    this.ladderClimbSeqId = seqId;
                    this._climbLadder(ladderId);
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

        const writer = HazelWriter.alloc(1);
        writer.upacked(ventid);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.EnterVent, writer.buffer)
        );
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

        const writer = HazelWriter.alloc(1);
        writer.upacked(ventid);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.ExitVent, writer.buffer)
        );
    }

    private _climbLadder(ladderId: number) {
        this.emit("player.climbladder", { ladderId });
    }

    climbLadder(ladderId: number) {
        this._climbLadder(ladderId);

        this.ladderClimbSeqId++;
        if (this.ladderClimbSeqId > 255) this.ladderClimbSeqId = 0;

        const writer = HazelWriter.alloc(2);
        writer.uint8(ladderId);
        writer.uint8(this.ladderClimbSeqId);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.ClimbLadder, writer.buffer)
        );
    }
}
