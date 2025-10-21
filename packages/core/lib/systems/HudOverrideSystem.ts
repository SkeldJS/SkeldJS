import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, HudOverrideSystemDataMessage, HudOverrideSystemMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SabotagableSystem } from "./SystemStatus";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";


export type HudOverrideSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;

/**
 * Represents a system responsible for handling communication sabotages on The Skeld and Polus.
 *
 * See {@link HudOverrideSystemEvents} for events to listen to.
 */
export class HudOverrideSystem<RoomType extends StatefulRoom> extends SabotagableSystem<RoomType, HudOverrideSystemEvents<RoomType>> {
    private hudOverriden: boolean = false;

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return HudOverrideSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof HudOverrideSystemDataMessage) {
            this.hudOverriden = data.isSabotaged;
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return new HudOverrideSystemDataMessage(this.hudOverriden);
        }
        return undefined;
    }

    isSabotaged(): boolean {
        return this.hudOverriden;
    }
    
    async sabotageWithAuth(): Promise<void> {
        this.hudOverriden = true;
        this.pushDataUpdate();
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return HudOverrideSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(message: BaseSystemMessage): Promise<void> {
        if (message instanceof HudOverrideSystemMessage) {
            this.hudOverriden = message.hudOverridden;
            this.pushDataUpdate();
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        void deltaSeconds;
    }
}
