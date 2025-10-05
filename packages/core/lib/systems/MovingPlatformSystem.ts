import {
    RepairSystemMessage,
    UsePlatformMessage,
    RpcMessage
} from "@skeldjs/protocol";

import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { StatefulRoom, PlayerResolvable } from "../StatefulRoom";
import { sequenceIdGreaterThan, SequenceIdType } from "../utils/sequenceIds";
import { MovingPlatformPlayerUpdateEvent } from "../events";
import { SystemStatusEvents } from "./events";

export interface MovingPlatformSystemData {
    useId: number;
    target: Player | undefined;
    side: MovingPlatformSide;
}

export enum MovingPlatformSide {
    Right,
    Left,
}

export type MovingPlatformSystemEvents<RoomType extends StatefulRoom = StatefulRoom> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[MovingPlatformPlayerUpdateEvent<RoomType>]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link MovingPlatformSystemEvents} for events to listen to.
 */
export class MovingPlatformSystem<RoomType extends StatefulRoom = StatefulRoom> extends SystemStatus<
    MovingPlatformSystemData,
    MovingPlatformSystemEvents,
    RoomType
> implements MovingPlatformSystemData {
    useId: number;
    target: Player<RoomType> | undefined;
    side: MovingPlatformSide;

    constructor(
        ship: InnerShipStatus<RoomType>,
        systemType: SystemType,
        data?: HazelReader | MovingPlatformSystemData
    ) {
        super(ship, systemType, data);

        this.useId ||= 0;
        this.target ||= undefined;
        this.side ||= MovingPlatformSide.Right;
    }

    /**
     * The opposite side of the moving platform to move in.
     */
    get oppositeSide() {
        return this.side === MovingPlatformSide.Left
            ? MovingPlatformSide.Right
            : MovingPlatformSide.Left;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    deserializeFromReader(reader: HazelReader, spawn: boolean) {
        if (spawn) {
            this.useId = reader.uint8();
            const targetId = reader.uint32();
            this._setTarget(
                targetId === 255
                    ? undefined
                    : this.ship.room.getPlayerByNetId(targetId),
                reader.uint8(),
                undefined
            );
        } else {
            const newSid = reader.uint8();
            if (sequenceIdGreaterThan(newSid, this.useId, SequenceIdType.Byte)) {
                this.useId = newSid;
                const targetId = reader.uint32();
                this._setTarget(
                    targetId === 255
                        ? undefined
                        : this.ship.room.getPlayerByNetId(targetId),
                    reader.uint8(),
                    undefined
                );
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    serializeToWriter(writer: HazelWriter, spawn: boolean) {
        this.useId++;
        if (this.useId > 255)
            this.useId = 0;

        writer.uint8(this.useId);
        writer.uint32(this.target?.characterControl?.netId ?? 255);
        writer.uint8(this.side);
        this.dirty = spawn;
    }

    private async _setTarget(player: Player<RoomType> | undefined, side: MovingPlatformSide, rpc: RepairSystemMessage | undefined) {
        const oldTarget = player;
        const oldSide = this.side;
        this.target = player;
        this.side = side;
        this.dirty = true;

        const ev = await this.emit(
            new MovingPlatformPlayerUpdateEvent(
                this.room,
                this,
                rpc,
                player,
                side
            )
        );

        if (ev.reverted) {
            this.target = oldTarget;
            this.side = oldSide;
            this.dirty = true;
            return;
        }

        this.target = ev.alteredPlayer;
        this.side = ev.alteredSide;
        this.dirty = true;
    }

    /**
     * Update the target of the moving platform.
     * @param player The player to set.
     * @param side The direction to move the moving platform in.
     */
    async setTarget(player: PlayerResolvable, side: MovingPlatformSide, sendRpc: boolean) {
        const resolved = this.ship.room.resolvePlayer(player);

        if (!resolved)
            return;

        if (this.side === side)
            return;

        const oldSide = this.side;
        await this._setTarget(resolved, side, undefined);

        if (sendRpc && this.side !== oldSide) {
            if (this.target?.characterControl) {
                this.ship.room.messageStream.push(
                    new RpcMessage(
                        this.target.characterControl.netId,
                        new UsePlatformMessage
                    )
                );
            }
        }
    }

    /**
     * Get on the moving platform as the client's player.
     */
    async movePlatform(player: Player) {
        await this.setTarget(player, this.oppositeSide, true);
    }

    setSide(side: MovingPlatformSide) {
        if (this.side === side)
            return;

        this.side = side;
        this.dirty = true;
    }
    
    async handleRepairByPlayer(player: Player | undefined, amount: number, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, amount, rpc;
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async handleSabotageByPlayer(player: Player | undefined, rpc: RepairSystemMessage | undefined): Promise<void> {
        void player, rpc;
    }

    async fullyRepairHost(): Promise<void> {
        void 0;
    }

    async fullyRepairPlayer(player: Player | undefined): Promise<void> {
        void player;
    }

    async sendFullRepair(player: Player): Promise<void> {
        void player;
    }
}
