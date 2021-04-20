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

export class PacketDecoder {
    listeners: Map<Deserializable, Set<(message: Serializable, direction: MessageDirection, sender: any) => void>>;
    types: Map<string, Map<number, Deserializable>>;

    constructor() {
        this.reset();
    }

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

    register(...messageClasses: Deserializable[]) {
        for (const messageClass of messageClasses) {
            const classes = this.getClasses(messageClass.type);

            classes.set(messageClass.tag, messageClass);
        }
    }

    emitDecoded(option: Serializable, direction: MessageDirection, sender: any) {
        this.emit(option, direction, sender);

        if (!option.children) return;

        for (const child of option.children) {
            this.emitDecoded(child, direction, sender);
        }
    }

    emit(message: Serializable, direction: MessageDirection, sender: any) {
        const classes = this.types.get(message.type);

        if (classes) {
            const messageClass = classes.get(message.tag);
            const listeners = this.getListeners(messageClass);

            for (const listener of listeners) {
                listener(message, direction, sender);
            }
        }
    }

    getListeners<T extends Deserializable>(
        messageClass: Deserializable
    ): Set<(message: GetSerialized<T>, direction: MessageDirection, sender: any) => void> {
        const listeners = this.listeners.get(messageClass);

        if (listeners)
            return listeners;

        this.listeners.set(messageClass, new Set());

        return this.getListeners(messageClass);
    }

    on<T extends Deserializable>(
        messageClass: T,
        listener: (
            message: GetSerialized<T>,
            direction: MessageDirection,
            sender: any
        ) => void
    ) {
        const listeners = this.getListeners(messageClass);

        listeners.add(listener);

        return this.off.bind(this, messageClass, listener);
    }

    off<T extends Deserializable>(
        messageClass: T,
        listener: (
            message: GetSerialized<T>,
            direction: MessageDirection,
            sender: any
        ) => void
    ) {
        const listeners = this.getListeners(messageClass);

        listeners.delete(listener);
    }

    once<T extends Deserializable>(
        messageClass: T,
        listener: (
            message: GetSerialized<T>,
            direction: MessageDirection,
            sender: any
        ) => void
    ) {
        const removeListener = this.on(messageClass, (message, direction, sender) => {
            removeListener();
            listener(message, direction, sender);
        });

        return removeListener;
    }

    wait<T extends Deserializable>(
        messageClass: T
    ): Promise<{ message: GetSerialized<T>; direction: MessageDirection }> {
        return new Promise((resolve) => {
            this.once(messageClass, (message, direction) => {
                resolve({ message, direction });
            });
        });
    }

    waitf<T extends Deserializable>(
        messageClass: T,
        filter: (
            message: GetSerialized<T>,
            direction: MessageDirection,
            sender: any
        ) => boolean
    ): Promise<{ message: GetSerialized<T>; direction: MessageDirection, sender: any }> {
        return new Promise((resolve) => {
            const removeListener = this.on(messageClass, (message, direction, sender) => {
                if (filter(message, direction, sender)) {
                    removeListener();
                    resolve({ message, direction, sender });
                }
            });
        });
    }

    private _parse(
        reader: Buffer | HazelReader,
        direction: MessageDirection = MessageDirection.Clientbound
    ) {
        if (Buffer.isBuffer(reader)) {
            return this._parse(HazelReader.from(reader));
        }

        const optionMessages = this.types.get("option");

        const sendOption = reader.uint8();
        const optionMessageClass = optionMessages.get(sendOption);

        if (optionMessageClass) {
            const option = optionMessageClass.Deserialize(
                reader,
                direction,
                this
            );

            return option;
        }

        return null;
    }

    write(
        reader: Buffer | HazelReader,
        direction: MessageDirection = MessageDirection.Clientbound,
        sender: any
    ) {
        const option = this._parse(reader, direction);

        if (option) {
            this.emitDecoded(option, direction, sender);
        }
    }

    parse(
        reader: Buffer | HazelReader,
        direction: MessageDirection = MessageDirection.Clientbound
    ) {
        return this._parse(reader, direction);
    }
}
