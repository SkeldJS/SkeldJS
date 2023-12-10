import { HazelReader, HazelWriter } from "@skeldjs/util";

import {
    AcknowledgePacket,
    DisconnectPacket,
    HelloPacket,
    PingPacket,
    ReliablePacket,
    UnreliablePacket,
} from "./packets/option";

import {
    AlterGameMessage,
    EndGameMessage,
    GameDataMessage,
    GameDataToMessage,
    GetGameListMessage,
    HostGameMessage,
    JoinedGameMessage,
    JoinGameMessage,
    KickPlayerMessage,
    QueryPlatformIdsMessage,
    RedirectMessage,
    RemoveGameMessage,
    RemovePlayerMessage,
    ReportPlayerMessage,
    SetActivePodTypeMessage,
    SetGameSessionMessage,
    StartGameMessage,
    WaitForHostMessage,
} from "./packets/root";

import {
    ClientInfoMessage,
    DataMessage,
    DespawnMessage,
    ReadyMessage,
    RpcMessage,
    SceneChangeMessage,
    SpawnMessage,
} from "./packets/game";

import {
    AddVoteMessage,
    CastVoteMessage,
    CheckColorMessage,
    CheckMurderMessage,
    CheckNameMessage,
    CheckProtectMessage,
    ClearVoteMessage,
    ClimbLadderMessage,
    CloseDoorsOfTypeMessage,
    CloseMessage,
    CompleteTaskMessage,
    EnterVentMessage,
    PetMessage,
    ExitVentMessage,
    MurderPlayerMessage,
    PlayAnimationMessage,
    ProtectPlayerMessage,
    RepairSystemMessage,
    ReportDeadBodyMessage,
    SendChatMessage,
    SendChatNoteMessage,
    SendQuickChatMessage,
    SetColorMessage,
    SetHatMessage,
    SetInfectedMessage,
    SetNameMessage,
    SetNameplateMessage,
    SetPetMessage,
    SetRoleMessage,
    SetScanner,
    SetSkinMessage,
    SetStartCounterMessage,
    SetTasksMessage,
    SetVisorMessage,
    ShapeshiftMessage,
    SnapToMessage,
    StartMeetingMessage,
    SyncSettingsMessage,
    UpdateSystemMessage,
    UsePlatformMessage,
    VotingCompleteMessage
} from "./packets/rpc";

import {
    VentilationSystemMessage
} from "./packets/system";

import { PacketDecoderConfig } from "./misc";

export enum MessageDirection {
    Clientbound,
    Serverbound,
}

export interface Serializable {
    messageType: string;
    messageTag: number;

    children?: Serializable[];

    Serialize(
        writer: HazelWriter,
        direction: MessageDirection,
        decoder: PacketDecoder
    ): void;
}

export type GetSerialized<T extends Deserializable> = T extends {
    new (...args: any[]): infer X;
}
    ? X
    : never;

export interface Deserializable {
    messageType: string;
    messageTag: number;

    new (...args: any[]): Serializable;

    Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ): Serializable;
}

export type MessageMapKey = `${string}:${number}`;
export type MessageListener<T extends Serializable, ContextType> = (
    message: T,
    direction: MessageDirection,
    context: ContextType
) => void

export class PacketDecoder<ContextType = any> {
    config: PacketDecoderConfig;

    listeners: Map<MessageMapKey, MessageListener<Serializable, ContextType>[]
    >;
    types: Map<MessageMapKey, Deserializable>;

    constructor(config: Partial<PacketDecoderConfig> = {}) {
        this.config = {
            useDtlsLayout: false,
            writeUnknownRootMessages: false,
            writeUnknownGameData: false,
            ...config
        };

        this.listeners = new Map;
        this.types = new Map;

        this.reset();
    }

    /**
     * Reset the packet decoder, removing all custom packets and removing listeners.
     */
    reset() {
        this.listeners.clear();
        this.types.clear();

        this.register(
            AcknowledgePacket,
            DisconnectPacket,
            HelloPacket,
            PingPacket,
            ReliablePacket,
            UnreliablePacket
        );

        this.register(
            AlterGameMessage,
            EndGameMessage,
            GameDataMessage,
            GameDataToMessage,
            GetGameListMessage,
            HostGameMessage,
            JoinedGameMessage,
            JoinGameMessage,
            KickPlayerMessage,
            QueryPlatformIdsMessage,
            RedirectMessage,
            RemoveGameMessage,
            RemovePlayerMessage,
            ReportPlayerMessage,
            SetActivePodTypeMessage,
            SetGameSessionMessage,
            StartGameMessage,
            WaitForHostMessage
        );

        this.register(
            ClientInfoMessage,
            DataMessage,
            DespawnMessage,
            ReadyMessage,
            RpcMessage,
            SpawnMessage
        );

        this.register(
            AddVoteMessage,
            CastVoteMessage,
            CheckColorMessage,
            CheckMurderMessage,
            CheckNameMessage,
            CheckProtectMessage,
            ClearVoteMessage,
            ClimbLadderMessage,
            CloseMessage,
            CloseDoorsOfTypeMessage,
            CompleteTaskMessage,
            EnterVentMessage,
            PetMessage,
            ExitVentMessage,
            MurderPlayerMessage,
            PlayAnimationMessage,
            ProtectPlayerMessage,
            RepairSystemMessage,
            ReportDeadBodyMessage,
            SceneChangeMessage,
            SendChatMessage,
            SendChatNoteMessage,
            SendQuickChatMessage,
            SetColorMessage,
            SetInfectedMessage,
            SetNameMessage,
            SetNameplateMessage,
            SetPetMessage,
            SetRoleMessage,
            SetScanner,
            SetSkinMessage,
            SetStartCounterMessage,
            SetTasksMessage,
            SetVisorMessage,
            ShapeshiftMessage,
            SnapToMessage,
            StartMeetingMessage,
            SyncSettingsMessage,
            UpdateSystemMessage,
            UsePlatformMessage,
            VotingCompleteMessage,
            SetHatMessage
        );

        this.register(
            VentilationSystemMessage
        );
    }

    clear() {
        this.listeners.clear();
        this.types.clear();
    }

    /**
     * Register a message or several messages to the packet decoder.
     * @param messageClasses The packet or packets to register.
     */
    register(...messageClasses: Deserializable[]) {
        for (let i = 0; i < messageClasses.length; i++) {
            const messageClass = messageClasses[i];
            this.types.set(`${messageClass.messageType}:${messageClass.messageTag}`, messageClass);
        }
    }

    /**
     * Emit a decoded message to all listeners concurrently, also emits the message's children recursively.
     * @param message The message to emit.
     * @param direction The direction that the message was sent.
     * @param context Additional metadata for the message, e.g. the context.
     */
    async emitDecoded(
        message: Serializable,
        direction: MessageDirection,
        context: ContextType
    ) {
        if (message.children) {
            for (let i = 0; i < message.children.length; i++) {
                await this.emitDecoded(message.children[i], direction, context);
            }
        }

        await this.emit(message, direction, context);
    }

    /**
     * Emit a decoded message to all listeners serially, also emits the message's children recursively.
     * @param message The message to emit.
     * @param direction The direction that the message was sent.
     * @param context Additional metadata for the message, e.g. the context.
     */
    async emitDecodedSerial(
        message: Serializable,
        direction: MessageDirection,
        context: ContextType
    ) {
        if (message.children) {
            for (let i = 0; i < message.children.length; i++) {
                await this.emitDecodedSerial(message.children[i], direction, context);
            }
        }

        await this.emitSerial(message, direction, context);

    }

    async emit(
        message: Serializable,
        direction: MessageDirection,
        context: ContextType
    ) {
        const messageClass = this.types.get(`${message.messageType}:${message.messageTag}`);

        if (messageClass) {
            const listeners = this.getListeners(messageClass);
            const promises = [];
            for (let i = 0; i < listeners.length; i++) {
                const listener = listeners[i];
                promises.push(listener(message, direction, context));
            }
            await Promise.all(promises);
        }
    }

    async emitSerial(
        message: Serializable,
        direction: MessageDirection,
        context: ContextType
    ) {
        const messageClass = this.types.get(`${message.messageType}:${message.messageTag}`);

        if (messageClass) {
            const listeners = this.getListeners(messageClass);

            for (let i = 0; i < listeners.length; i++) {
                const listener = listeners[i];
                await listener(message, direction, context);
            }
        }
    }

    /**
     * Get all listeners for a packet.
     * @param messageClass The packet to get listeners for.
     * @returns All listeners for the packet.
     */
    getListeners<T extends Deserializable>(
        messageClass: Deserializable
    ): MessageListener<GetSerialized<T>, ContextType>[] {
        const msgKey = `${messageClass.messageType}:${messageClass.messageTag}` as MessageMapKey;
        const cachedListeners = this.listeners.get(msgKey);
        const listeners = cachedListeners || [];

        if (!cachedListeners)
            this.listeners.set(msgKey, listeners);


        return listeners;
    }

    /**
     * Listen to a message being sent through the decoder.
     * @param messageClass The message to listen for.
     * @param listener The callback for when the message is decoded.
     * @returns A function to remove the listener.
     */
    on<T extends Deserializable>(
        messageClass: T,
        listener: MessageListener<GetSerialized<T>, ContextType>
    ): () => void;
    /**
     * Listen to any of several messages being sent through the decoder.
     * @param messageClass The messages to listen for.
     * @param listener The callback for when one of the messages is decoded.
     * @returns A function to remove the listener.
     */
    on<T extends Deserializable[]>(
        messageClass: T,
        listener: MessageListener<GetSerialized<T[number]>, ContextType>
    ): () => void;
    on(
        messageClass: any,
        listener: (
            message: any,
            direction: MessageDirection,
            context: ContextType
        ) => void
    ) {
        if (Array.isArray(messageClass)) {
            for (let i = 0; i < messageClass.length; i++) {
                const single = messageClass[i];
                const listeners = this.getListeners(single);
                listeners.push(listener);
            }
        } else {
            const listeners = this.getListeners(messageClass);

            listeners.push(listener);
        }

        return () => this.off(messageClass, listener);
    }

    /**
     * Remove a listener from a message.
     * @param messageClass The message to listen for.
     * @param listener The listener to remove.
     */
    off<T extends Deserializable>(
        messageClass: T,
        listener: MessageListener<GetSerialized<T>, ContextType>
    ): void;
    /**
     * Remove a listener from several messages being listened to.
     * @param messageClass The message to listen for.
     * @param listener The listener to remove.
     */
    off<T extends Deserializable[]>(
        messageClass: T,
        listener: MessageListener<GetSerialized<T[number]>, ContextType>
    ): void;
    off(
        messageClass: any,
        listener: MessageListener<any, ContextType>
    ) {
        if (Array.isArray(messageClass)) {
            for (let i = 0; i < messageClass.length; i++) {
                const single = messageClass[i];
                const listeners = this.getListeners(single);

                const idx = listeners.indexOf(listener);
                if (idx > -1) {
                    listeners.splice(idx, 1);
                }
            }
        } else {
            const listeners = this.getListeners(messageClass);
            const idx = listeners.indexOf(listener);
            if (idx > -1) {
                listeners.splice(idx, 1);
            }
        }
    }

    /**
     * Listen to a message being sent through the decoder once.
     * @param messageClass The message to listen for.
     * @param listener The callback for when the message is decoded.
     * @returns A function to remove the listener.
     */
    once<T extends Deserializable>(
        messageClass: T,
        listener: MessageListener<GetSerialized<T>, ContextType>
    ): () => void;
    /**
     * Listen to any of several messages being sent through the decoder once.
     * @param messageClass The messages to listen for.
     * @param listener The callback for when one of the messages is decoded.
     * @returns A function to remove the listener.
     */
    once<T extends Deserializable[]>(
        messageClass: T,
        listener: MessageListener<GetSerialized<T[number]>, ContextType>
    ): () => void;
    once(
        messageClass: any,
        listener: (
            message: any,
            direction: MessageDirection,
            context: ContextType
        ) => void
    ) {
        const removeListener = this.on(
            messageClass,
            (message, direction, context) => {
                removeListener();
                listener(message, direction, context);
            }
        );

        return removeListener;
    }

    /**
     * Asynchronously wait for a message to be decoded.
     * @param messageClass The message to listen for.
     * @returns A promise containing the message, direciton and context metadata for the message.
     */
    wait<T extends Deserializable>(
        messageClass: T
    ): Promise<{
        message: GetSerialized<T>;
        direction: MessageDirection;
        context: ContextType;
    }> {
        return new Promise((resolve) => {
            this.once(messageClass, (message, direction, context) => {
                resolve({ message, direction, context });
            });
        });
    }

    /**
     * Asynchronously wait for a specific message to be decoded.
     * @param messageClass The message to listen for.
     * @param filter A filter for the message to wait for.
     * @returns A function to remove the listener.
     */
    waitf<T extends Deserializable>(
        messageClass: T,
        filter: (
            message: GetSerialized<T>,
            direction: MessageDirection,
            context: ContextType
        ) => boolean
    ): Promise<{
        message: GetSerialized<T>;
        direction: MessageDirection;
        context: ContextType;
    }> {
        return new Promise((resolve) => {
            const removeListener = this.on(
                messageClass,
                (message, direction, context) => {
                    if (filter(message, direction, context)) {
                        removeListener();
                        resolve({ message, direction, context: context });
                    }
                }
            );
        });
    }

    private _parse(
        reader: Buffer | HazelReader,
        direction: MessageDirection = MessageDirection.Clientbound
    ): Serializable|null {
        if (Buffer.isBuffer(reader)) {
            return this._parse(HazelReader.from(reader), direction);
        }

        const sendOption = reader.uint8();
        const optionMessageClass = this.types.get(`option:${sendOption}`);

        if (!optionMessageClass)
            return null;

        const message = optionMessageClass.Deserialize(
            reader,
            direction,
            this
        );

        return message;
    }

    /**
     * Write a buffer or reader to the decoder.
     * @param reader The buffer or reader to decode.
     * @param direction The direction that the packet was sent.
     * @param context Additional metadata for the context.
     */
    async write(
        reader: Buffer | HazelReader,
        direction: MessageDirection = MessageDirection.Clientbound,
        context: ContextType
    ) {
        const message = this._parse(reader, direction);

        if (message) {
            await this.emitDecoded(message, direction, context);
        }

        return message;
    }

    /**
     * Parse a buffer or reader in place, without emitting the resultant message.
     * @param reader The buffer or reader to parse.
     * @param direction The direction that the packet was sent.
     * @returns The parsed message.
     */
    parse(
        reader: Buffer | HazelReader,
        direction: MessageDirection = MessageDirection.Clientbound
    ) {
        return this._parse(reader, direction);
    }
}
