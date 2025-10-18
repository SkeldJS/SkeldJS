import { HazelReader, HazelWriter } from "@skeldjs/hazel";
import { RpcMessageTag, SpawnType } from "@skeldjs/constant";
import { BaseDataMessage, BaseRpcMessage, GameManagerDataMessage, LogicDataMessage, UnknownDataMessage } from "@skeldjs/protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { DataState, NetworkedObject, NetworkedObjectEvents } from "../NetworkedObject";
import { StatefulRoom } from "../StatefulRoom";
import { GameLogicComponent } from "../logic";
import { PlayerControl } from "./PlayerControl";

export type InnerGameManagerEvents<RoomType extends StatefulRoom> = NetworkedObjectEvents<RoomType> & ExtractEventTypes<[]>;

export abstract class InnerGameManager<RoomType extends StatefulRoom> extends NetworkedObject<RoomType, InnerGameManagerEvents<RoomType>> {
    logicComponents: GameLogicComponent<any, RoomType>[] = [];

    constructor(
        room: RoomType,
        spawnType: SpawnType,
        netId: number,
        ownerId: number,
        flags: number,
    ) {
        super(room, spawnType, netId, ownerId, flags);

        this.initComponents();
    }

    get owner() {
        return super.owner as RoomType;
    }

    parseRemoteCall(rpcTag: RpcMessageTag, reader: HazelReader): BaseRpcMessage | undefined {
        return undefined;
    }
    
    async handleRemoteCall(rpc: BaseRpcMessage): Promise<void> {
        void rpc;
    }

    async processFixedUpdate(delta: number): Promise<void> {
        void delta;
    }

    async processAwake(): Promise<void> {
        void 0;
    }

    parseData(state: DataState, reader: HazelReader): BaseDataMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update: return GameManagerDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseDataMessage): Promise<void> {
        if (data instanceof GameManagerDataMessage) {
            for (const componentData of data.components) {
                const component = this.logicComponents[componentData.index];
                if (componentData.data instanceof UnknownDataMessage) {
                    const parsedData = component.parseData(componentData.data.dataReader);
                    if (parsedData) {
                        await component.handleData(parsedData);
                    }
                } else {
                    await component.handleData(componentData.data);
                }
            }
        }
    }

    createData(state: DataState): BaseDataMessage | undefined {
        switch (state) {
        case DataState.Spawn:
        case DataState.Update:
            const componentsData = [];
            for (let i = 0; i < this.logicComponents.length; i++) {
                const logicComponent = this.logicComponents[i];
                if (state === DataState.Spawn || logicComponent.isDirty) {
                    const logicData = logicComponent.createData();
                    if (logicData) {
                        componentsData.push(new LogicDataMessage(i, logicData));
                    }
                    logicComponent.isDirty = false;
                }
            }
            if (componentsData.length > 0) return new GameManagerDataMessage(componentsData);
        }
        return undefined;
    }
    
    async onGameStart(): Promise<void> {
        for (const component of this.logicComponents) {
            await component.onGameStart();
        }
    }

    abstract initComponents(): void;
    abstract onPlayerDeath(playerControl: PlayerControl<RoomType>, assignGhostRole: boolean): Promise<void>;
}
