import { HazelReader } from "@skeldjs/util";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";
import {
    BaseRpcMessage,
    ClimbLadderMessage,
    EnterVentMessage,
    ExitVentMessage,
    RpcMessage,
} from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { Networkable, NetworkableEvents } from "../../Networkable";
import { PlayerData } from "../../PlayerData";
import { Hostable } from "../../Hostable";

import { NetworkUtils } from "../../utils/net";

import {
    PlayerClimbLadderEvent,
    PlayerEnterVentEvent,
    PlayerExitVentEvent,
} from "../../events";
import { PlayerControl } from "../PlayerControl";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface PlayerPhysicsData {
    ventid: number;
}

export type PlayerPhysicsEvents<RoomType extends Hostable = Hostable> = NetworkableEvents<RoomType> &
    ExtractEventTypes<
        [PlayerEnterVentEvent<RoomType>, PlayerExitVentEvent<RoomType>, PlayerClimbLadderEvent<RoomType>]
    >;

/**
 * Represents a player object for handling vent entering and exiting.
 *
 * See {@link PlayerPhysicsEvents} for events to listen to.
 */
export class PlayerPhysics<RoomType extends Hostable = Hostable> extends Networkable<
    PlayerPhysicsData,
    PlayerPhysicsEvents,
    RoomType
> implements PlayerPhysicsData {
    /**
     * The ID of the vent that the player is currently in.
     */
    ventid: number;

    /**
     * The player that this component belongs to.
     */
    player: PlayerData<RoomType>;

    private ladderClimbSeqId: number;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netid: number,
        ownerid: number,
        flags: number,
        data?: HazelReader | PlayerPhysicsData,
        playerControl?: PlayerControl<RoomType>
    ) {
        super(room, spawnType, netid, ownerid, flags, data);

        this.ventid ??= -1;
        this.ladderClimbSeqId = 0;

        this.player = this.owner as PlayerData<RoomType>;

        if (playerControl) {
            this.components = playerControl.components;
        }
    }

    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.messageTag) {
            case RpcMessageTag.EnterVent:
                await this._handleEnterVent(rpc as EnterVentMessage);
                break;
            case RpcMessageTag.ExitVent: {
                await this._handleExitVent(rpc as ExitVentMessage);
                break;
            }
            case RpcMessageTag.ClimbLadder:
                await this._handleClimbLadder(rpc as ClimbLadderMessage);
                break;
        }
    }

    private async _handleEnterVent(rpc: EnterVentMessage) {
        this._enterVent(rpc.ventid);

        await this.emit(
            new PlayerEnterVentEvent(
                this.room,
                this.player,
                rpc,
                rpc.ventid
            )
        );
    }

    private _enterVent(ventid: number) {
        this.ventid = ventid;
    }

    private _rpcEnterVent(ventid: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new EnterVentMessage(ventid)
            )
        );
    }

    /**
     * Enter a vent on the map by its ID.
     *
     * Emits a {@link PlayerEnterVentEvent | `player.entervent`} event.
     *
     * @param ventid The ID of the vent to enter.
     * @example
     *```typescript
     * client.me.physics.enterVent(PolusVent.Office);
     * ```
     */
    enterVent(ventid: number) {
        this._enterVent(ventid);
        this.emit(
            new PlayerEnterVentEvent(
                this.room,
                this.player,
                undefined,
                ventid
            )
        );
        this._rpcEnterVent(ventid);
    }

    private async _handleExitVent(rpc: ExitVentMessage) {
        this._exitVent(rpc.ventid);

        await this.emit(
            new PlayerExitVentEvent(
                this.room,
                this.player,
                rpc,
                rpc.ventid
            )
        );
    }

    private _exitVent(ventid: number) {
        this.ventid = -1;
    }

    private _rpcExitVent(ventid: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new ExitVentMessage(ventid)
            )
        );
    }

    /**
     * Exit a vent (Does not have to be the same vent or in the same network
     * as the vent you entered).
     *
     * Emits a {@link PlayerExitVentEvent | `player.exitvent`} event.
     *
     * @param ventid The ID of the vent to exit.
     * @example
     *```typescript
     * client.me.physics.enterVent(PolusVent.Office);
     * ```
     */
    exitVent(ventid: number) {
        this._exitVent(ventid);
        this.emit(
            new PlayerExitVentEvent(
                this.room,
                this.player,
                undefined,
                ventid
            )
        );
        this._rpcExitVent(ventid);
    }

    private async _handleClimbLadder(rpc: ClimbLadderMessage) {
        if (
            NetworkUtils.seqIdGreaterThan(
                rpc.sequenceid,
                this.ladderClimbSeqId,
                1
            )
        ) {
            this.ladderClimbSeqId = rpc.sequenceid;

            await this.emit(
                new PlayerClimbLadderEvent(
                    this.room,
                    this.player,
                    rpc,
                    rpc.ladderid
                )
            );
        }
    }

    private _rpcClimbLadder(ladderid: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netId,
                new ClimbLadderMessage(ladderid, this.ladderClimbSeqId)
            )
        );
    }

    /**
     * Climb a ladder on the map by its ID.
     *
     * Emits a {@link PlayerClimbLadderEvent | `player.climbladder`} event.
     *
     * @param ladderid The ID of the ladder to climb.
     */
    async climbLadder(ladderid: number) {
        this.ladderClimbSeqId++;
        if (this.ladderClimbSeqId > 255) this.ladderClimbSeqId = 0;

        this._rpcClimbLadder(ladderid);

        await this.emit(
            new PlayerClimbLadderEvent(
                this.room,
                this.player,
                undefined,
                ladderid
            )
        );
    }
}
