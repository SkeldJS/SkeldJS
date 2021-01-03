import {
    AlterGameTag,
    DisconnectReason,
    GameEndReason,
    MapID,
    PayloadTag
} from "@skeldjs/constant"

import { GameOptions } from "../misc/GameOptions";
import { GameDataMessage } from "./GameData";

import { BaseHazelMessage } from "./Packet";

export interface BasePayloadMessage extends BaseHazelMessage {
    tag: PayloadTag;
    bound?: "server"|"client";
}

export interface HostGamePayloadClientbound extends BasePayloadMessage {
    tag: PayloadTag.HostGame;
    bound?: "client";
    code: number;
}

export interface HostGamePayloadServerbound {
    tag: PayloadTag.HostGame;
    bound?: "server";
    settings: GameOptions;
}

export type HostGamePayload = HostGamePayloadClientbound|HostGamePayloadServerbound;

export interface BaseJoinGamePayloadClientbound extends BasePayloadMessage {
    tag: PayloadTag.JoinGame;
    bound?: "client";
    error: boolean;
}

export interface JoinGamePayloadClientboundError extends BaseJoinGamePayloadClientbound {
    tag: PayloadTag.JoinGame;
    bound?: "client";
    error: true;
    reason: DisconnectReason;
}

export interface JoinGamePayloadClientboundNewPlayer extends BaseJoinGamePayloadClientbound {
    tag: PayloadTag.JoinGame;
    bound?: "client";
    error: false;
    code: number;
    clientid: number;
    hostid: number;
}

export type JoinGamePayloadClientbound = JoinGamePayloadClientboundError|JoinGamePayloadClientboundNewPlayer;

export interface JoinGamePayloadServerbound extends BasePayloadMessage {
    tag: PayloadTag.JoinGame;
    bound?: "server";
    code: number;
    mapOwnership: number;
}

export type JoinGamePayload = JoinGamePayloadClientbound|JoinGamePayloadServerbound

export interface StartGamePayload extends BasePayloadMessage {
    tag: PayloadTag.StartGame;
    code: number;
}

export interface RemoveGamePayload extends BasePayloadMessage {
    tag: PayloadTag.RemoveGame;
    reason?: DisconnectReason;
}

export interface BaseRemovePlayerPayload extends BasePayloadMessage {
    tag: PayloadTag.RemovePlayer;
    code: number;
    clientid: number;
    reason: DisconnectReason;
}

export interface RemovePlayerPayloadClientbound extends BaseRemovePlayerPayload {
    bound?: "client";
    hostid: number;
}

export interface RemovePlayerPayloadServerbound extends BaseRemovePlayerPayload {
    bound?: "server";
}

export type RemovePlayerPayload = RemovePlayerPayloadClientbound|RemovePlayerPayloadServerbound;

export interface GameDataPayload extends BasePayloadMessage {
    tag: PayloadTag.GameData;
    code: number;
    messages: GameDataMessage[];
}

export interface GameDataToPayload extends BasePayloadMessage {
    tag: PayloadTag.GameDataTo;
    code: number;
    recipientid: number;
    messages: GameDataMessage[];
}

export interface JoinedGamePayload extends BasePayloadMessage {
    tag: PayloadTag.JoinedGame;
    code: number;
    clientid: number;
    hostid: number;
    clients: number[];
}

export interface EndGamePayload extends BasePayloadMessage {
    tag: PayloadTag.EndGame;
    code: number;
    reason: GameEndReason;
    show_ad: boolean;
}

export interface GetGameListPayload extends BasePayloadMessage {
    tag: PayloadTag.GetGameList;
}

export interface AlterGamePayload extends BasePayloadMessage {
    tag: PayloadTag.AlterGame;
    code: number;
    alter_tag: AlterGameTag;
    value: number;
}

export interface KickPlayerPayload extends BasePayloadMessage {
    tag: PayloadTag.KickPlayer;
    code: number;
    clientid: number;
    banned: boolean;
    reason?: DisconnectReason;
}

export interface WaitForHostPayload extends BasePayloadMessage {
    tag: PayloadTag.WaitForHost;
    code: number;
    clientid: number;
}

export interface RedirectPayload extends BasePayloadMessage {
    tag: PayloadTag.Redirect;
    ip: string;
    port: number;
}

export interface MasterServer {
    name: string;
    ip: string;
    port: number;
    players: number;
}

export interface ReselectServerPayload extends BasePayloadMessage {
    tag: PayloadTag.MasterServerList;
    servers: MasterServer[];
}

export interface GetGameListV2GameListing {
    ip: string;
    port: number;
    code: number;
    name: string;
    players: number;
    age: number;
    map: MapID;
    impostors: number;
    max_players: number;
}

export interface GetGameListV2GameCounts {
    theskeld: number;
    mirahq: number;
    polus: number;
}

export interface GetGameListV2PayloadClientbound extends BasePayloadMessage {
    tag: PayloadTag.GetGameListV2;
    bound?: "client";
    counts?: GetGameListV2GameCounts;
    games: GetGameListV2GameListing[];
}

export interface GetGameListV2PayloadServerbound extends BasePayloadMessage {
    tag: PayloadTag.GetGameListV2;
    bound?: "server";
    options: GameOptions;
}

export type GetGameListV2 = GetGameListV2PayloadClientbound|GetGameListV2PayloadServerbound;

export type PayloadMessageBidirectional = StartGamePayload |
    RemoveGamePayload |
    GameDataPayload |
    GameDataToPayload |
    JoinedGamePayload |
    EndGamePayload |
    GetGameListPayload |
    AlterGamePayload |
    KickPlayerPayload |
    WaitForHostPayload |
    RedirectPayload |
    ReselectServerPayload;

export type PayloadMessageClientbound = PayloadMessageBidirectional |
    HostGamePayloadClientbound |
    JoinGamePayloadClientbound |
    RemovePlayerPayloadClientbound |
    GetGameListV2PayloadClientbound;

export type PayloadMessageServerbound = PayloadMessageBidirectional |
    HostGamePayloadServerbound |
    JoinGamePayloadServerbound |
    RemovePlayerPayloadServerbound |
    GetGameListV2PayloadServerbound;

export type PayloadMessage = PayloadMessageClientbound|PayloadMessageServerbound;