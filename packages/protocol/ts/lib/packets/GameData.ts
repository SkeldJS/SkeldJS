import { MessageTag } from "@skeldjs/constant";

import { HazelBuffer } from "@skeldjs/util";

import { BaseHazelMessage } from "./Packets";
import { RpcMessage } from "./RpcMessages";

export interface BaseGameDataMessage extends BaseHazelMessage {
    tag: MessageTag;
}

export interface DataMessage extends BaseGameDataMessage {
    tag: MessageTag.Data;
    netid: number;
    data: HazelBuffer;
}

export interface ComponentData {
    netid: number;
    data: HazelBuffer;
}

export interface SpawnMessage extends BaseGameDataMessage {
    tag: MessageTag.Spawn;
    type: number;
    ownerid: number;
    flags: number;
    components: ComponentData[];
}

export interface DespawnMessage extends BaseGameDataMessage {
    tag: MessageTag.Despawn;
    netid: number;
}

export interface SceneChangeMessage extends BaseGameDataMessage {
    tag: MessageTag.SceneChange;
    clientid: number;
    scene: string;
}

export interface ReadyMessage extends BaseGameDataMessage {
    tag: MessageTag.Ready;
    clientid: number;
}

export interface ChangeSettings extends BaseGameDataMessage {
    tag: MessageTag.ChangeSettings;
}

export type GameDataMessage =
    | DataMessage
    | RpcMessage
    | SpawnMessage
    | DespawnMessage
    | SceneChangeMessage
    | ReadyMessage
    | ChangeSettings;
