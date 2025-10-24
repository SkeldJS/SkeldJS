import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, HudOverrideSystemDataMessage, HudOverrideSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SabotagableSystem } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { PlayerControl } from "../objects";
import { Player } from "../Player";


export type HudOverrideSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HudOverrideSystemEvents} for events to listen to.
 */
export class HudOverrideSystem<RoomType extends StatefulRoom> extends SabotagableSystem<RoomType, HudOverrideSystemEvents<RoomType>> {
    private hudOverridden: boolean = false;

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return HudOverrideSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof HudOverrideSystemDataMessage) {
            const beforeSabotaged = this.hudOverridden;
            this.hudOverridden = data.hudOverridden;
            if (beforeSabotaged !== this.hudOverridden) {
                if (this.hudOverridden) {
                    // TODO: event: sabotaged
                } else {
                    // TODO: event: not sabotaged
                }
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new HudOverrideSystemDataMessage(this.hudOverridden);
        }
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return HudOverrideSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof HudOverrideSystemMessage) {
            if (message.hudOverridden) {
                await this.sabotageWithAuth();
            } else {
                await this.fullyRepairWithAuth();
            }
            this.pushDataUpdate();
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        void deltaSeconds;
    }

    isSabotaged(): boolean {
        return this.hudOverridden;
    }
    
    async sabotageWithAuth(): Promise<void> {
        this.hudOverridden = true;
        this.pushDataUpdate();
    }

    async fullyRepairWithAuth(): Promise<void> {
        this.hudOverridden = false;
        this.pushDataUpdate();
    }

    async fullyRepairRequest(): Promise<void> {
        // TODO: implement
    }
}
