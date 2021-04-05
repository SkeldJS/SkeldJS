import { HazelBuffer } from "@skeldjs/util";
import { MessageTag, RpcTag, SystemType } from "@skeldjs/constant";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { BaseSystemStatusEvents } from "./events";
import { PlayerData } from "../PlayerData";
import { PlayerDataResolvable } from "../Hostable";
import { NetworkUtils } from "../utils/net";

export interface MovingPlatformSystemData {
    useId: number;
    target: PlayerData;
    side: MovingPlatformSide;
}

export enum MovingPlatformSide {
    Right,
    Left,
}

export interface MovingPlatformSystemEvents extends BaseSystemStatusEvents {
    /**
     * Emitted when a player gets on the platform. (Can be null if no one is on it.)
     */
    "platform.player.update": {
        /**
         * The player who got on the platform.
         */
        player: PlayerData;

        /**
         * The direction that the player is moving in.
         */
        side: MovingPlatformSide;
    };
}

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link MovingPlatformSystemEvents} for events to listen to.
 */
export class MovingPlatformSystem extends SystemStatus<
    MovingPlatformSystemData,
    MovingPlatformSystemEvents
> {
    static systemType = SystemType.Decontamination as const;
    systemType = SystemType.Decontamination as const;

    private useId: number;
    target: PlayerData;
    side: MovingPlatformSide;

    constructor(
        ship: InnerShipStatus,
        data?: HazelBuffer | MovingPlatformSystemData
    ) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        if (spawn) {
            this.useId = reader.uint8();
            const targetId = reader.uint8();
            this.setTarget(
                targetId === 255
                    ? null
                    : this.ship.room.getPlayerByNetId(targetId),
                reader.uint8()
            );
        } else {
            const newSid = reader.uint8();
            if (NetworkUtils.seqIdGreaterThan(newSid, this.useId, 1)) {
                this.useId = newSid;
                const targetId = reader.uint8();
                this.setTarget(
                    targetId === 255
                        ? null
                        : this.ship.room.getPlayerByNetId(targetId),
                    reader.uint8()
                );
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        this.useId++;
        if (this.useId > 255) this.useId = 0;

        writer.uint8(this.useId);
        writer.uint8(this.target?.control?.netid ?? null);
        writer.uint8(this.side);
        this.dirty = spawn;
    }

    private _setTarget(player: PlayerData, side: MovingPlatformSide) {
        this.target = player;
        this.emit("platform.player.update", { player, side });
    }

    setTarget(player: PlayerDataResolvable, side: MovingPlatformSide) {
        const resolved = this.ship.room.resolvePlayer(player);

        if (this.target === resolved) return;

        if (resolved) {
            this.ship.room.stream.push({
                tag: MessageTag.RPC,
                netid: resolved.control.netid,
                rpcid: RpcTag.UsePlatform,
            });
        }

        this._setTarget(resolved, side);
    }
}
