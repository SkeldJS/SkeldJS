import { HazelReader, HazelWriter } from "@skeldjs/util";
import { SystemType } from "@skeldjs/constant";
import { RepairSystemMessage, RpcMessage, UsePlatformMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { InnerShipStatus } from "../objects";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { Hostable, PlayerDataResolvable } from "../Hostable";
import { NetworkUtils } from "../utils/net";
import { MovingPlatformPlayerUpdateEvent } from "../events";
import { SystemStatusEvents } from "./events";

export interface MovingPlatformSystemData {
    useId: number;
    target: PlayerData|undefined;
    side: MovingPlatformSide;
}

export enum MovingPlatformSide {
    Right,
    Left,
}

export type MovingPlatformSystemEvents<RoomType extends Hostable = Hostable> = SystemStatusEvents<RoomType> &
    ExtractEventTypes<[MovingPlatformPlayerUpdateEvent<RoomType>]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link MovingPlatformSystemEvents} for events to listen to.
 */
export class MovingPlatformSystem<RoomType extends Hostable = Hostable> extends SystemStatus<
    MovingPlatformSystemData,
    MovingPlatformSystemEvents,
    RoomType
> implements MovingPlatformSystemData {
    static systemType = SystemType.Decontamination as const;
    systemType = SystemType.Decontamination as const;

    useId: number;
    target: PlayerData<RoomType>|undefined;
    side: MovingPlatformSide;

    constructor(
        ship: InnerShipStatus<RoomType>,
        data?: HazelReader | MovingPlatformSystemData
    ) {
        super(ship, data);

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
    Deserialize(reader: HazelReader, spawn: boolean) {
        if (spawn) {
            this.useId = reader.uint8();
            const targetId = reader.uint8();
            this._setTarget(
                reader.uint8(),
                targetId === 255
                    ? undefined
                    : this.ship.room.getPlayerByNetId(targetId),
                undefined
            );
        } else {
            const newSid = reader.uint8();
            if (NetworkUtils.seqIdGreaterThan(newSid, this.useId, 1)) {
                this.useId = newSid;
                const targetId = reader.uint8();
                this._setTarget(
                    reader.uint8(),
                    targetId === 255
                        ? undefined
                        : this.ship.room.getPlayerByNetId(targetId),
                    undefined
                );
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelWriter, spawn: boolean) {
        this.useId++;
        if (this.useId > 255) this.useId = 0;

        writer.uint8(this.useId);
        writer.uint8(this.target?.control?.netid ?? 255);
        writer.uint8(this.side);
        this.dirty = spawn;
    }

    private async _setTarget(side: MovingPlatformSide, player: PlayerData<RoomType>|undefined, rpc: RepairSystemMessage|undefined) {
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
            return;
        }

        this.target = ev.alteredPlayer;
        this.side = ev.alteredSide;
    }

    /**
     * Update the target of the moving platform.
     * @param player The player to set.
     * @param side The direction to move the moving platform in.
     */
    async setTarget(player: PlayerDataResolvable, side: MovingPlatformSide) {
        const resolved = this.ship.room.resolvePlayer(player);

        if (!resolved)
            return;

        if (this.target === resolved)
            return;

        if (this.side === side)
            return;

        const oldTarget = this.target;
        const oldSide = this.side;
        await this._setTarget(side, oldTarget, undefined);

        if (this.target !== oldTarget || this.side !== oldSide) {
            if (this.target?.control) {
                this.ship.room.stream.push(
                    new RpcMessage(
                        this.target.control.netid,
                        new UsePlatformMessage
                    )
                );
            }
        }
    }

    /**
     * Get on the moving platform as the client's player.
     */
    async getOn() {
        if (!this.room.myPlayer?.control)
            return;

        await this.setTarget(this.room.myPlayer, this.oppositeSide);
    }
}
