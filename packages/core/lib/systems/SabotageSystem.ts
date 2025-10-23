import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, SabotageSystemDataMessage, SabotageSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SystemStatus } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";

export type SabotageSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling system sabotages.
 *
 * See {@link SabotageSystemEvents} for events to listen to.
 */
export class SabotageSystem<RoomType extends StatefulRoom> extends SystemStatus<RoomType, SabotageSystemEvents<RoomType>> {
    /**
     * The cooldown before another sabotage can happen.
     */
    cooldown: number = 0;

    /**
     * Check whether any systems are currently sabotaged.
     */
    get anySabotaged() {
        return Object.values(this.shipStatus.systems).some(
            system => system?.sabotaged
        );
    }

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return SabotageSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof SabotageSystemDataMessage) {
            this.cooldown = data.cooldown;
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new SabotageSystemDataMessage(this.cooldown);
        }
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return SabotageSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof SabotageSystemMessage) {
            const system = this.shipStatus.systems.get(message.systemType);
            if (system && system.canBeSabotaged()) {
                await system.sabotageWithAuth();
            }
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.cooldown > 0 && !this.shipStatus.anySystemsSabotaged()) {
            this.cooldown -= deltaSeconds;
            this.pushDataUpdate();
        }
    }
}
