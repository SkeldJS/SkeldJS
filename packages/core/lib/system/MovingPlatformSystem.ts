import { HazelReader, HazelWriter } from "@skeldjs/util";
import { RpcMessageTag, SystemType } from "@skeldjs/constant";
import { RpcMessage } from "@skeldjs/protocol";

import { InnerShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { PlayerDataResolvable } from "../Hostable";
import { NetworkUtils } from "../utils/net";
import { MovingPlatformPlayerUpdateEvent } from "../events";
import { ExtractEventTypes } from "@skeldjs/events";
import { SystemStatusEvents } from "./events";

export interface MovingPlatformSystemData {
    useId: number;
    target: PlayerData;
    side: MovingPlatformSide;
}

export enum MovingPlatformSide {
    Right,
    Left,
}

export type MovingPlatformSystemEvents =
    SystemStatusEvents &
ExtractEventTypes<[
    MovingPlatformPlayerUpdateEvent
]>;

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
        data?: HazelReader | MovingPlatformSystemData
    ) {
        super(ship, data);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelReader, spawn: boolean) {
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
    Serialize(writer: HazelWriter, spawn: boolean) {
        this.useId++;
        if (this.useId > 255) this.useId = 0;

        writer.uint8(this.useId);
        writer.uint8(this.target?.control?.netid ?? null);
        writer.uint8(this.side);
        this.dirty = spawn;
    }

    private _setTarget(player: PlayerData, side: MovingPlatformSide) {
        this.target = player;
        this.emit(
            new MovingPlatformPlayerUpdateEvent(
                this.ship?.room,
                this,
                player,
                side
            )
        );
    }

    setTarget(player: PlayerDataResolvable, side: MovingPlatformSide) {
        const resolved = this.ship.room.resolvePlayer(player);

        if (this.target === resolved) return;

        if (resolved) {
            this.ship.room.stream.push(
                new RpcMessage(
                    resolved.control.netid,
                    RpcMessageTag.UsePlatform,
                    Buffer.alloc(0)
                )
            );
        }

        this._setTarget(resolved, side);
    }
}
