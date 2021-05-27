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

export type PlayerPhysicsEvents = NetworkableEvents &
    ExtractEventTypes<
        [PlayerEnterVentEvent, PlayerExitVentEvent, PlayerClimbLadderEvent]
    >;

/**
 * Represents a player object for handling vent entering and exiting.
 *
 * See {@link PlayerPhysicsEvents} for events to listen to.
 */
export class PlayerPhysics extends Networkable<
    PlayerPhysicsData,
    PlayerPhysicsEvents
> implements PlayerPhysicsData {
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

        this.ventid ||= 0;
        this.ladderClimbSeqId = 0;
    }

    get player() {
        return this.owner as PlayerData;
    }

    async HandleRpc(rpc: BaseRpcMessage) {
        switch (rpc.tag) {
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
            new PlayerEnterVentEvent(this.room, this.player, rpc.ventid)
        );
    }

    private _enterVent(ventid: number) {
        this.ventid = ventid;
    }

    private _rpcEnterVent(ventid: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new EnterVentMessage(ventid)
            )
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

    private async _handleExitVent(rpc: ExitVentMessage) {
        this._exitVent(rpc.ventid);

        await this.emit(
            new PlayerExitVentEvent(this.room, this.player, rpc.ventid)
        );
    }

    private _exitVent(ventid: number) {
        this.ventid = -1;
        this.emit(new PlayerExitVentEvent(this.room, this.player, ventid));
    }

    private _rpcExitVent(ventid: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new ExitVentMessage(ventid)
            )
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
                new PlayerClimbLadderEvent(this.room, this.player, rpc.ladderid)
            );
        }
    }

    private _rpcClimbLadder(ladderid: number) {
        this.room.stream.push(
            new RpcMessage(
                this.netid,
                new ClimbLadderMessage(ladderid, this.ladderClimbSeqId)
            )
        );
    }

    climbLadder(ladderid: number) {
        this.ladderClimbSeqId++;
        if (this.ladderClimbSeqId > 255) this.ladderClimbSeqId = 0;

        this._rpcClimbLadder(ladderid);
    }
}
