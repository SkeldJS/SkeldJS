import {
    RepairSystemMessage,
    UsePlatformMessage,
    RpcMessage,
    BaseSystemMessage,
    MovingPlatformSystemDataMessage
} from "@skeldjs/protocol";

import { HazelReader } from "@skeldjs/hazel";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";
import { Player } from "../Player";

import { StatefulRoom, PlayerResolvable } from "../StatefulRoom";
import { sequenceIdGreaterThan, SequenceIdType } from "../utils/sequenceIds";
import { DataState } from "../NetworkedObject";

export enum MovingPlatformSide {
    Right,
    Left,
}

export type MovingPlatformSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system for doors that must be manually opened.
 *
 * See {@link MovingPlatformSystemEvents} for events to listen to.
 */
export class MovingPlatformSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, MovingPlatformSystemEvents<RoomType>> {
    useId: number = 0;
    target: Player<RoomType> | undefined = undefined;
    side: MovingPlatformSide = MovingPlatformSide.Right;

    /**
     * The opposite side of the moving platform to move in.
     */
    get oppositeSide() {
        return this.side === MovingPlatformSide.Left
            ? MovingPlatformSide.Right
            : MovingPlatformSide.Left;
    }
    
    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            return MovingPlatformSystemDataMessage.deserializeFromReaderState(reader, dataState === DataState.Spawn);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof MovingPlatformSystemDataMessage) {
            if (data.isSpawn) {
                this.useId = data.sequenceId;
            } else {
                if (!sequenceIdGreaterThan(data.sequenceId, this.useId, SequenceIdType.Byte)) return;
            }

            this.target = data.targetId === null ? undefined : this.shipStatus.room.getPlayerByPlayerId(data.targetId);
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            return new MovingPlatformSystemDataMessage(
                dataState === DataState.Spawn,
                this.useId,
                this.target?.getPlayerId() ?? null,
                this.side
            );
        }
        return undefined;
    }
}
