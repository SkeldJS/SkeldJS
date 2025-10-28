import { HazelReader, HazelWriter, Vector2 } from "@skeldjs/hazel";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";

import {
    BaseSystemMessage,
    BaseRpcMessage,
    CancelPetMessage,
    ClimbLadderMessage,
    EnterVentMessage,
    ExitVentMessage,
    PetMessage,
    RpcMessage,
    BootFromVentMessage,
} from "@skeldjs/protocol";

import { ExtractEventTypes } from "@skeldjs/events";

import { DataState, NetworkedObject, NetworkedObjectEvents } from "../../NetworkedObject";
import { Player } from "../../Player";
import { StatefulRoom } from "../../StatefulRoom";

import { sequenceIdGreaterThan, SequenceIdType } from "../../utils/sequenceIds";

import {
    PlayerCancelPetEvent,
    PlayerClimbLadderEvent,
    PlayerEnterVentEvent,
    PlayerExitVentEvent,
    PlayerPetEvent,
} from "../../events";

export type PlayerPhysicsEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[
    PlayerEnterVentEvent<RoomType>,
    PlayerExitVentEvent<RoomType>,
    PlayerClimbLadderEvent<RoomType>
]>;

/**
 * Represents a player object for handling vent entering and exiting.
 *
 * See {@link PlayerPhysicsEvents} for events to listen to.
 */
export class PlayerPhysics<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, PlayerPhysicsEvents<RoomType>> {
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
    ) {
        super(room, spawnType, netId, ownerId, flags);

        this.ventId = -1;
        this.ladderClimbSeqId = 0;

        this.player = this.owner as Player<RoomType>;
    }

    get isInVent() {
        return this.ventId > -1;
    }
    
    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async processAwake(): Promise<void> {
        void 0;
    }

    parseData(state: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        void data;
    }

    createData(state: DataState): BaseSystemMessage | undefined {
        return undefined;
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        switch (rpcTag) {
            case RpcMessageTag.EnterVent: return EnterVentMessage.deserializeFromReader(reader);
            case RpcMessageTag.ExitVent: return ExitVentMessage.deserializeFromReader(reader);
            case RpcMessageTag.ClimbLadder: return ClimbLadderMessage.deserializeFromReader(reader);
            case RpcMessageTag.BootFromVent: return BootFromVentMessage.deserializeFromReader(reader);
            case RpcMessageTag.Pet: return PetMessage.deserializeFromReader(reader);
            case RpcMessageTag.CancelPet: return CancelPetMessage.deserializeFromReader();
        }
        return undefined;
    }

    async handleRemoteCall(rpc: BaseRpcMessage) {
        if (rpc instanceof EnterVentMessage) return await this._handleEnterVent(rpc);
        if (rpc instanceof ExitVentMessage) return await this._handleExitVent(rpc);
        if (rpc instanceof ClimbLadderMessage) return await this._handleClimbLadder(rpc);
        if (rpc instanceof BootFromVentMessage) return await this._handleBootFromVent(rpc);
        if (rpc instanceof PetMessage) return await this._handlePet(rpc);
        if (rpc instanceof CancelPetMessage) return await this._handleCancelPet(rpc);
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
        this.room.broadcastLazy(
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
        this.room.broadcastLazy(
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
        if (sequenceIdGreaterThan(rpc.sequenceId, this.ladderClimbSeqId, SequenceIdType.Byte)) {
            this.ladderClimbSeqId = rpc.sequenceId;

            await this.emit(
                new PlayerClimbLadderEvent(
                    this.room,
                    this.player,
                    rpc,
                    rpc.ladderId
                )
            );
        }
    }

    private _rpcClimbLadder(ladderid: number) {
        this.room.broadcastLazy(
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

    private async _handleBootFromVent(rpc: BootFromVentMessage) {
        // TODO: emit event
    }

    private _rpcBootFromVent(ventId: number) {
        this.room.broadcastLazy(
            new RpcMessage(
                this.netId,
                new BootFromVentMessage(ventId)
            )
        );
    }

    async bootFromVent(ventId: number) {
        this._rpcBootFromVent(ventId);
    }

    private async _handlePet(rpc: PetMessage) {
        const ev = await this.emit(
            new PlayerPetEvent(
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
        this.room.broadcastLazy(
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
            new PlayerPetEvent(
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
        this.room.broadcastLazy(
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
