import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, SabotageSystemDataMessage, SabotageSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { System } from "./System";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";

export type SabotageSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling system sabotages.
 *
 * See {@link SabotageSystemEvents} for events to listen to.
 */
export class SabotageSystem<RoomType extends StatefulRoom> extends System<RoomType, SabotageSystemEvents<RoomType>> {
    static initialCooldown = 10;
    static activateDuration = 30;

    /**
     * Only available to the room authority.
     */
    initialCooldown: number = SabotageSystem.initialCooldown;

    /**
     * The cooldown before another sabotage can happen.
     */
    cooldown: number = 0;

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
        case DataState.Update:
            return new SabotageSystemDataMessage(this.getCooldown());
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
                this.cooldown = SabotageSystem.activateDuration;
                this.pushDataUpdate();
            }
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        if (this.shipStatus.anySystemsSabotaged()) return;

        if (this.initialCooldown > 0) {
            this.initialCooldown = Math.max(this.initialCooldown - deltaSeconds, 0);
            this.pushDataUpdate();
        } else if (this.cooldown > 0) {
            this.cooldown = Math.max(this.cooldown - deltaSeconds, 0);
            this.pushDataUpdate();
        }
    }

    getCooldown() {
        if (this.room.canManageObject(this.shipStatus)) {
            if (this.initialCooldown > 0) {
                return this.initialCooldown;
            }
        }
        return this.cooldown;
    }

    isSabotageAvailable() {
        return this.getCooldown() <= 0;
    }
}
