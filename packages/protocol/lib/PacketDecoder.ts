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
    RedirectMessage,
    RemoveGameMessage,
    RemovePlayerMessage,
    ReportPlayerMessage,
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

export enum MessageDirection {
    Clientbound,
    Serverbound,
}

export interface Serializable {
    type: string;
    tag: number;

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
    type: string;
    tag: number;

    new (...args: any[]): Serializable;

    Deserialize(
        reader: HazelReader,
        direction: MessageDirection,
        decoder: PacketDecoder
    ): Serializable;
}

export class PacketDecoder<SenderType = any> {
    listeners: Map<
        Deserializable,
        Set<
            (
                message: Serializable,
                direction: MessageDirection,
                sender: SenderType
            ) => void
        >
    >;
    types: Map<string, Map<number, Deserializable>>;

    constructor() {
        this.reset();
    }

    /**
     * Reset the packet decoder, removing all custom packets and removing listeners.
     */
    reset() {
        this.listeners = new Map();
        this.types = new Map();

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
            RedirectMessage,
            RemoveGameMessage,
            RemovePlayerMessage,
            ReportPlayerMessage,
            StartGameMessage,
            WaitForHostMessage
        );

        this.register(
            ClientInfoMessage,
            DataMessage,
            DespawnMessage,
            ReadyMessage,
            RpcMessage,
            SceneChangeMessage,
            SpawnMessage
        );
    }

    private getClasses(type: string): Map<number, Deserializable> {
        const classes = this.types.get(type);

        if (classes) {
            return classes;
        }

        this.types.set(type, new Map());
        return this.getClasses(type);
    }

    /**
     * Register a message or several messages to the packet decoder.
     * @param messageClasses The packet or packets to register.
     */
    register(...messageClasses: Deserializable[]) {
        for (const messageClass of messageClasses) {
            const classes = this.getClasses(messageClass.type);

            classes.set(messageClass.tag, messageClass);
        }
    }

    /**
     * Emit a decoded message to all listeners, also emits the message's children recursively.
     * @param message The message to emit.
     * @param direction The direction that the message was sent.
     * @param sender Additional metadata for the message, e.g. the sender.
     */
    emitDecoded(
        message: Serializable,
        direction: MessageDirection,
        sender: SenderType
    ) {
        this.emit(message, direction, sender);

        if (!message.children) return;

        for (const child of message.children) {
            this.emitDecoded(child, direction, sender);
        }
    }

    private emit(
        message: Serializable,
        direction: MessageDirection,
        sender: SenderType
    ) {
        const classes = this.types.get(message.type);

        if (classes) {
            const messageClass = classes.get(message.tag);
            const listeners = this.getListeners(messageClass);

            for (const listener of listeners) {
                listener(message, direction, sender);
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
    ): Set<
        (
            message: GetSerialized<T>,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    > {
        const listeners = this.listeners.get(messageClass);

        if (listeners) return listeners;

        this.listeners.set(messageClass, new Set());

        return this.getListeners(messageClass);
    }

    /**
     * Listen to a message being sent through the decoder.
     * @param messageClass The message to listen for.
     * @param listener The callback for when the message is decoded.
     * @returns A function to remove the listener.
     */
    on<T extends Deserializable>(
        messageClass: T,
        listener: (
            message: GetSerialized<T>,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    );
    /**
     * Listen to any of several messages being sent through the decoder.
     * @param messageClass The messages to listen for.
     * @param listener The callback for when one of the messages is decoded.
     * @returns A function to remove the listener.
     */
    on<T extends Deserializable[]>(
        messageClass: T,
        listener: (
            message: GetSerialized<T[number]>,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    );
    on(
        messageClass: any,
        listener: (
            message: any,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    ) {
        if (Array.isArray(messageClass)) {
            for (const single of messageClass) {
                const listeners = this.getListeners(single);

                listeners.add(listener);
            }
        } else {
            const listeners = this.getListeners(messageClass);

            listeners.add(listener);
        }

        return this.off.bind(this, messageClass, listener);
    }

    /**
     * Remove a listener from a message.
     * @param messageClass The message to listen for.
     * @param listener The listener to remove.
     */
    off<T extends Deserializable>(
        messageClass: T,
        listener: (
            message: GetSerialized<T>,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    );
    /**
     * Remove a listener from several messages being listened to.
     * @param messageClass The message to listen for.
     * @param listener The listener to remove.
     */
    off<T extends Deserializable[]>(
        messageClass: T,
        listener: (
            message: GetSerialized<T[number]>,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    );
    off(
        messageClass: any,
        listener: (
            message: any,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    ) {
        if (Array.isArray(messageClass)) {
            for (const single of messageClass) {
                const listeners = this.getListeners(single);

                listeners.delete(listener);
            }
        } else {
            const listeners = this.getListeners(messageClass);

            listeners.delete(listener);
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
        listener: (
            message: GetSerialized<T>,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    );
    /**
     * Listen to any of several messages being sent through the decoder once.
     * @param messageClass The messages to listen for.
     * @param listener The callback for when one of the messages is decoded.
     * @returns A function to remove the listener.
     */
    once<T extends Deserializable[]>(
        messageClass: T,
        listener: (
            message: GetSerialized<T[number]>,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    );
    once(
        messageClass: any,
        listener: (
            message: any,
            direction: MessageDirection,
            sender: SenderType
        ) => void
    ) {
        const removeListener = this.on(
            messageClass,
            (message, direction, sender) => {
                removeListener();
                listener(message, direction, sender);
            }
        );

        return removeListener;
    }

    /**
     * Asynchronously wait for a message to be decoded.
     * @param messageClass The message to listen for.
     * @returns A promise containing the message, direciton and sender metadata for the message.
     */
    wait<T extends Deserializable>(
        messageClass: T
    ): Promise<{
        message: GetSerialized<T>;
        direction: MessageDirection;
        sender: SenderType;
    }> {
        return new Promise((resolve) => {
            this.once(messageClass, (message, direction, sender) => {
                resolve({ message, direction, sender });
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
            sender: SenderType
        ) => boolean
    ): Promise<{
        message: GetSerialized<T>;
        direction: MessageDirection;
        sender: SenderType;
    }> {
        return new Promise((resolve) => {
            const removeListener = this.on(
                messageClass,
                (message, direction, sender) => {
                    if (filter(message, direction, sender)) {
                        removeListener();
                        resolve({ message, direction, sender });
                    }
                }
            );
        });
    }

    private _parse(
        reader: Buffer | HazelReader,
        direction: MessageDirection = MessageDirection.Clientbound
    ): Serializable {
        if (Buffer.isBuffer(reader)) {
            return this._parse(HazelReader.from(reader));
        }

        const optionMessages = this.types.get("option");

        const sendOption = reader.uint8();
        const optionMessageClass = optionMessages.get(sendOption);

        if (optionMessageClass) {
            const message = optionMessageClass.Deserialize(
                reader,
                direction,
                this
            );

            return message;
        }

        return null;
    }

    /**
     * Write a buffer or reader to the decoder.
     * @param reader The buffer or reader to decode.
     * @param direction The direction that the packet was sent.
     * @param sender Additional metadata for the sender.
     */
    write(
        reader: Buffer | HazelReader,
        direction: MessageDirection = MessageDirection.Clientbound,
        sender: SenderType
    ) {
        const message = this._parse(reader, direction);

        if (message) {
            this.emitDecoded(message, direction, sender);
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
