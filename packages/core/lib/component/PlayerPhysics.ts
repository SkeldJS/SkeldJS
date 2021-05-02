import { HazelReader, HazelWriter } from "@skeldjs/util";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";
import { RpcMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../Networkable";
import { PlayerData } from "../PlayerData";
import { Hostable } from "../Hostable";

import { NetworkUtils } from "../utils/net";

import {
    PlayerClimbLadderEvent,
    PlayerEnterVentEvent,
    PlayerExitVentEvent,
} from "../events";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface PlayerPhysicsData {
    ventid: number;
}

export type PlayerPhysicsEvents =
    NetworkableEvents &
ExtractEventTypes<[
    PlayerEnterVentEvent,
    PlayerExitVentEvent,
    PlayerClimbLadderEvent
]>;

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
    ventid: number;

    private ladderClimbSeqId: number;

    constructor(
        room: Hostable<any>,
        netid: number,
        ownerid: number,
        data?: HazelReader | PlayerPhysicsData
    ) {
        super(room, netid, ownerid, data);
    }

    get player() {
        return this.owner as PlayerData;
    }

    async HandleRpc(callid: RpcMessageTag, reader: HazelReader) {
        switch (callid) {
            case RpcMessageTag.EnterVent:
                await this._handleEnterVent(reader);
                break;
            case RpcMessageTag.ExitVent: {
                await this._handleExitVent(reader);
                break;
            }
            case RpcMessageTag.ClimbLadder:
                await this._handleClimbLadder(reader);
                break;
        }
    }

    private async _handleEnterVent(reader: HazelReader) {
        const ventid = reader.upacked();
        this._enterVent(ventid);

        await this.emit(
            new PlayerEnterVentEvent(
                this.room,
                this.player,
                ventid
            )
        );
    }

    private _enterVent(ventid: number) {
        this.ventid = ventid;
    }

    private _rpcEnterVent(ventid: number) {
        const writer = HazelWriter.alloc(1);
        writer.upacked(ventid);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.EnterVent, writer.buffer)
        );
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
        this._rpcEnterVent(ventid);
    }

    private async _handleExitVent(reader: HazelReader) {
        const ventid = reader.upacked();
        this._exitVent(ventid);

        await this.emit(
            new PlayerExitVentEvent(
                this.room,
                this.player,
                ventid
            )
        );
    }

    private _exitVent(ventid: number) {
        this.ventid = null;
        this.emit(new PlayerExitVentEvent(this.room, this.player, ventid));
    }

    private _rpcExitVent(ventid: number) {
        const writer = HazelWriter.alloc(1);
        writer.upacked(ventid);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.ExitVent, writer.buffer)
        );
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
        this._rpcExitVent(ventid);
    }

    private async _handleClimbLadder(reader: HazelReader) {
        const ladderid = reader.uint8();
        const seqId = reader.uint8();

        if (
            NetworkUtils.seqIdGreaterThan(
                seqId,
                this.ladderClimbSeqId,
                1
            )
        ) {
            this.ladderClimbSeqId = seqId;

            await this.emit(
                new PlayerClimbLadderEvent(
                    this.room,
                    this.player,
                    ladderid
                )
            );
        }
    }

    private _rpcClimbLadder(ladderid: number) {
        const writer = HazelWriter.alloc(2);
        writer.uint8(ladderid);
        writer.uint8(this.ladderClimbSeqId);

        this.room.stream.push(
            new RpcMessage(this.netid, RpcMessageTag.ClimbLadder, writer.buffer)
        );
    }

    climbLadder(ladderid: number) {
        this.ladderClimbSeqId++;
        if (this.ladderClimbSeqId > 255)
            this.ladderClimbSeqId = 0;

        this._rpcClimbLadder(ladderid);
    }
}
