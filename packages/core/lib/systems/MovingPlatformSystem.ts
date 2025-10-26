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

import { StatefulRoom } from "../StatefulRoom";
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
        switch (this.side) {
        case MovingPlatformSide.Right: return MovingPlatformSide.Left;
        case MovingPlatformSide.Left: return MovingPlatformSide.Right;
        }
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

            this.target = data.targetNetId === null ? undefined : this.shipStatus.room.getPlayerByNetId(data.targetNetId);
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            return new MovingPlatformSystemDataMessage(
                dataState === DataState.Spawn,
                this.useId,
                this.target?.characterControl?.netId ?? null,
                this.side
            );
        }
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return undefined;
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        void player, message;
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        void deltaSeconds;
    }
}
