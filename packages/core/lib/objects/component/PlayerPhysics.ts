import { HazelReader, Vector2 } from "@skeldjs/util";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";

import {
    BaseRpcMessage,
    CancelPetMessage,
    ClimbLadderMessage,
    EnterVentMessage,
    ExitVentMessage,
    PetMessage,
    RpcMessage,
} from "@skeldjs/protocol";

import { ExtractEventTypes } from "@skeldjs/events";

import { NetworkedObject, NetworkedObjectEvents } from "../../NetworkedObject";
import { Player } from "../../Player";
import { StatefulRoom } from "../../StatefulRoom";

import { sequenceIdGreaterThan, SequenceIdType } from "../../utils/sequenceIds";

import {
    PlayerCancelPetEvent,
    PlayerClimbLadderEvent,
    PlayerEnterVentEvent,
    PlayerExitVentEvent,
    PlayerPetPetEvent,
} from "../../events";

import { PlayerControl } from "../PlayerControl";

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface PlayerPhysicsData {
    ventId: number;
}

export type PlayerPhysicsEvents<RoomType extends StatefulRoom = StatefulRoom> = NetworkedObjectEvents<RoomType> &
    ExtractEventTypes<
        [PlayerEnterVentEvent<RoomType>, PlayerExitVentEvent<RoomType>, PlayerClimbLadderEvent<RoomType>]
    >;

/**
 * Represents a player object for handling vent entering and exiting.
 *
 * See {@link PlayerPhysicsEvents} for events to listen to.
 */
export class PlayerPhysics<RoomType extends StatefulRoom = StatefulRoom> extends NetworkedObject<
    PlayerPhysicsData,
    PlayerPhysicsEvents,
    RoomType
> implements PlayerPhysicsData {
    /**
     * The ID of the vent that the player is currently in.
     */
    ventId: number;

    /**
     * The player that this component belongs to.
     */
    player: Player<RoomType>;

    private ladderClimbSeqId: number;

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
        data?: HazelReader | PlayerPhysicsData,
        playerControl?: PlayerControl<RoomType>
    ) {
        super(room, spawnType, netId, ownerId, flags, data);

        this.ventId ??= -1;
        this.ladderClimbSeqId = 0;

        this.player = this.owner as Player<RoomType>;

        if (playerControl) {
            this.components = playerControl.components;
        }
    }

    get isInVent() {
        return this.ventId > -1;
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
            case RpcMessageTag.Pet:
                await this._handlePet(rpc as PetMessage);
                break;
            case RpcMessageTag.CancelPet:
                await this._handleCancelPet(rpc as CancelPetMessage);
                break;
        }
    }

    private async _handleEnterVent(rpc: EnterVentMessage) {
        this._enterVent(rpc.ventId);

        await this.emit(
            new PlayerEnterVentEvent(
                this.room,
                this.player,
                rpc,
                rpc.ventId
            )
        );
    }

    private _enterVent(ventId: number) {
        this.ventId = ventId;
    }

    private _rpcEnterVent(ventId: number) {
        this.room.messageStream.push(
            new RpcMessage(
                this.netId,
                new EnterVentMessage(ventId)
            )
        );
    }

    /**
     * Enter a vent on the map by its ID.
     *
     * Emits a {@link PlayerEnterVentEvent | `player.entervent`} event.
     *
     * @param ventId The ID of the vent to enter.
     * @example
     *```typescript
     * client.me.physics.enterVent(PolusVent.Office);
     * ```
     */
    enterVent(ventId: number) {
        this._enterVent(ventId);
        this.emitSync(
            new PlayerEnterVentEvent(
                this.room,
                this.player,
                undefined,
                ventId
            )
        );
        this._rpcEnterVent(ventId);
    }

    private async _handleExitVent(rpc: ExitVentMessage) {
        this._exitVent(rpc.ventId);

        await this.emit(
            new PlayerExitVentEvent(
                this.room,
                this.player,
                rpc,
                rpc.ventId
            )
        );
    }

    private _exitVent(ventId: number) {
        this.ventId = -1;
    }

    private _rpcExitVent(ventId: number) {
        this.room.messageStream.push(
            new RpcMessage(
                this.netId,
                new ExitVentMessage(ventId)
            )
        );
    }

    /**
     * Exit a vent (Does not have to be the same vent or in the same network
     * as the vent you entered).
     *
     * Emits a {@link PlayerExitVentEvent | `player.exitvent`} event.
     *
     * @param ventId The ID of the vent to exit.
     * @example
     *```typescript
     * client.me.physics.enterVent(PolusVent.Office);
     * ```
     */
    exitVent(ventId: number) {
        this._exitVent(ventId);
        this.emitSync(
            new PlayerExitVentEvent(
                this.room,
                this.player,
                undefined,
                ventId
            )
        );
        this._rpcExitVent(ventId);
    }

    private async _handleClimbLadder(rpc: ClimbLadderMessage) {
        if (sequenceIdGreaterThan(rpc.sequenceid, this.ladderClimbSeqId, SequenceIdType.Byte)) {
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
        this.room.messageStream.push(
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

    private async _handlePet(rpc: PetMessage) {
        const ev = await this.emit(
            new PlayerPetPetEvent(
                this.room,
                this.player,
                undefined,
                rpc.playerPos,
                rpc.petPos
            )
        );

        if (ev.canceled) {
            await this.cancelPet();
            return;
        }
    }

    private _rpcPet(playerPos: Vector2, petPos: Vector2) {
        this.room.messageStream.push(
            new RpcMessage(
                this.netId,
                new PetMessage(
                    playerPos,
                    petPos
                )
            )
        );
    }

    /**
     * Visibly pet your pet or another player's pet.
     *
     * Unfortunately, due to technical limitations (as SkeldJS doesn't implement
     * various Unity physics/transform mechanics), there is no good way to get the
     * position of the pet except through manual scuffing, which is out of scope
     * of SkeldJS.
     * @param playerPos The position of the player while petting.
     * @param petPos The position of the pet to pet.
     */
    async petPet(playerPos: Vector2, petPos: Vector2) {
        const ev = await this.emit(
            new PlayerPetPetEvent(
                this.room,
                this.player,
                undefined,
                playerPos,
                petPos
            )
        );

        if (ev.canceled)
            return;

        this._rpcPet(playerPos, petPos);
    }

    private async _handleCancelPet(rpc: CancelPetMessage) {
        await this.emit(
            new PlayerCancelPetEvent(
                this.room,
                this.player,
                rpc
            )
        );
    }

    private _rpcCancelPet() {
        this.room.messageStream.push(
            new RpcMessage(
                this.netId,
                new CancelPetMessage
            )
        );
    }

    /**
     * Stop petting your or another player's pet.
     */
    async cancelPet() {
        await this.emit(
            new PlayerCancelPetEvent(
                this.room,
                this.player,
                undefined
            )
        );

        this._rpcCancelPet();
    }
}
