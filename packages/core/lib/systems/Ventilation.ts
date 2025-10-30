import { BaseSystemMessage, PlayerVentDataMessage, VentilationOperation, VentilationSystemDataMessage, VentilationSystemMessage } from "@skeldjs/protocol";
import { HazelReader } from "@skeldjs/hazel";
import { System } from "./System";
import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { PlayerPhysics } from "../objects";
import { Player } from "../Player";
import { sequenceIdGreaterThan, SequenceIdType } from "../utils/sequenceIds";

export type VentId = number;

export class VentilationSystem<RoomType extends StatefulRoom> extends System<RoomType> {
    playersCleaningVents: Map<Player<RoomType>, VentId> = new Map;
    playersInsideVents: Map<Player<RoomType>, VentId> = new Map;

    playerSequenceId: Map<Player<RoomType>, number> = new Map;

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            return VentilationSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof VentilationSystemDataMessage) {
            const beforeCleaning = new Map(this.playersCleaningVents);
            this.playersCleaningVents.clear();
            for (const newCleaning of data.cleaningVents) {
                const player = this.room.getPlayerByPlayerId(newCleaning.playerId);
                if (player) {
                    this.playersCleaningVents.set(player, newCleaning.ventId);

                    if (!beforeCleaning.has(player)) {
                        // TODO: event: player started cleaning
                    }
                }
            }

            for (const [ player, oldVentId ] of beforeCleaning) {
                const newVentId = this.playersCleaningVents.get(player);
                if (newVentId === undefined) {
                    // TODO: event: player no longer cleaning
                } else if (newVentId !== oldVentId) {
                    // TODO: event: player cleaning different vent
                }
            }
                
            const beforeInside = new Map(this.playersInsideVents);
            this.playersInsideVents.clear();
            for (const newInside of data.insideVents) {
                const player = this.room.getPlayerByPlayerId(newInside.playerId);
                if (player) {
                    this.playersInsideVents.set(player, newInside.ventId);

                    if (!beforeInside.has(player)) {
                        // TODO: event: player inside vent
                    }
                }
            }

            for (const [ player, oldVentId ] of beforeInside) {
                const newVentId = this.playersInsideVents.get(player);
                if (newVentId === undefined) {
                    // TODO: event: player no longer inside vent
                } else if (newVentId !== oldVentId) {
                    // TODO: event: player inside another vent
                }
            }
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            const message = new VentilationSystemDataMessage([], []);
            for (const [ player, ventId ] of this.playersCleaningVents) {
                const playerId = player.getPlayerId();
                if (playerId !== undefined) {
                    message.cleaningVents.push(new PlayerVentDataMessage(playerId, ventId));
                }
            }
            for (const [ player, ventId ] of this.playersInsideVents) {
                const playerId = player.getPlayerId();
                if (playerId !== undefined) {
                    message.insideVents.push(new PlayerVentDataMessage(playerId, ventId));
                }
            }
            return message;
        }
        return undefined;
    }

    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return VentilationSystemMessage.deserializeFromReader(reader);
    }

    async handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof VentilationSystemMessage) {
            // TODO: order these updates and handle them sequentially, properly.
            const cachedSequenceId = this.playerSequenceId.get(player);
            const previousSequenceId = cachedSequenceId || -1;

            if (!sequenceIdGreaterThan(message.sequenceId, previousSequenceId, SequenceIdType.Short))
                return;

            this.playerSequenceId.set(player, message.sequenceId);

            switch (message.operation) {
            case VentilationOperation.StartCleaning:
                const existingCleaningVent = this.playersInsideVents.get(player);
                if (existingCleaningVent === undefined) {
                    this.playersInsideVents.set(player, message.ventId);
                    // TODO: event: player cleaning vent
                } else if (existingCleaningVent !== message.ventId) {
                    this.playersInsideVents.set(player, message.ventId);
                    // TODO: event: player cleaning another vent
                }
                break;
            case VentilationOperation.StopCleaning:
                // I'm not sure why the game does it like this, why not just remove the
                // player from the map? hm.
                for (const [ player, ventId ] of this.playersCleaningVents) {
                    if (ventId === message.ventId) {
                        this.playersCleaningVents.delete(player);
                        // TODO: event: player stopped cleaning
                    }
                }
                break;
            case VentilationOperation.Enter:
                const existingInsideVent = this.playersInsideVents.get(player);
                if (existingInsideVent === undefined) {
                    this.playersInsideVents.set(player, message.ventId);
                    // TODO: event: player inside vent
                } else if (existingInsideVent !== message.ventId) {
                    this.playersInsideVents.set(player, message.ventId);
                    // TODO: event: player inside another vent
                }
                break;
            case VentilationOperation.Exit:
                // TODO: event: player no longer inside vent
            case VentilationOperation.Move:
                this.playersInsideVents.set(player, message.ventId);
                // TODO: event: player inside another vent
                break;
            case VentilationOperation.BootImpostors:
                for (const [ player, ventId ] of this.playersInsideVents) {
                    // TODO: what is "is invisible phantom on vent"?
                    this.playersInsideVents.delete(player);
                    // TODO: event: player no longer inside vent (but booted?)
                    const playerPhysics = player.characterControl?.getComponentSafe(1, PlayerPhysics);
                    if (playerPhysics) {
                        await playerPhysics.bootFromVent(ventId);
                    }
                }
                break;
            }
            this.pushDataUpdate();
        }
    }

    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        // TODO: removed disconected players. this may be slow.
    }
}