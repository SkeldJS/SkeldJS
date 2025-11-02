import { HazelReader } from "@skeldjs/hazel";
import { BaseSystemMessage, SwitchSystemDataMessage, SwitchSystemMessage } from "@skeldjs/au-protocol";
import { ExtractEventTypes } from "@skeldjs/events";

import { SabotagableSystem } from "./System";

import { StatefulRoom } from "../StatefulRoom";
import { DataState } from "../NetworkedObject";
import { Player } from "../Player";

type SwitchSetup = [boolean, boolean, boolean, boolean, boolean];

export type SwitchSystemEvents<RoomType extends StatefulRoom> = ExtractEventTypes<[]>;


/**
 * Read the value of each switch from a byte.
 * @param byte The byte to read from.
 * @returns An array of the value of each switch.
 * @example
 *```typescript
    * console.log(readSwitches(0x5));
    * // [ true, false, true, false, false ]
    * ```
    */
function parseSwitchBitfield(byte: number) {
    const vals: SwitchSetup = [false, false, false, false, false];

    vals[0] = !!(byte & 0x1);
    vals[1] = !!(byte & 0x2);
    vals[2] = !!(byte & 0x4);
    vals[3] = !!(byte & 0x8);
    vals[4] = !!(byte & 0x10);

    return vals;
}

/**
 * Write the value of each switch to a byte.
 * @param switches An array of the value of each switch.
 * @returns The byte representation of the switches.
 * @example
 *```typescript
    * console.log(writeSwitches([ false, true, false, false, true ]));
    * // 0x12 (18)
    * ```
    */
function createSwitchBitfield(switches: SwitchSetup) {
    return (
        ~~switches[0] |
        (~~switches[1] << 1) |
        (~~switches[2] << 2) |
        (~~switches[3] << 3) |
        (~~switches[4] << 4)
    );
}

/**
 * Represents a system responsible for handling switches in Electrical.
 *
 * See {@link SwitchSystemEvents} for events to listen to.
 */
export class SwitchSystem<RoomType extends StatefulRoom> extends SabotagableSystem<RoomType, SwitchSystemEvents<RoomType>> {
    // Corresponds to SwitchSystem.DetoriorationTime
    static updateCooldownDuration = 0.03;

    static minBrightness = 0;
    static maxBrightness = 255;
    static brightnessChangePerTick = 3;

    static flipChance = 0.5;
    static alwaysFlipSwitch = 2;

    /**
     * The switch states that are expected.
     */
    expected: SwitchSetup = [ false, false, false, false, false ];

    /**
     * The current switch states.
     */
    actual: SwitchSetup = [ false, false, false, false, false ];

    /**
     * The brightness of lights.
     */
    brightness: number = SwitchSystem.maxBrightness;
    
    protected updateCooldown: number = 0;

    parseData(dataState: DataState, reader: HazelReader): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update: return SwitchSystemDataMessage.deserializeFromReader(reader);
        }
        return undefined;
    }

    async _handleData(data: BaseSystemMessage): Promise<void> {
        if (data instanceof SwitchSystemDataMessage) {
            this.expected = parseSwitchBitfield(data.expectedBitfield);
            this.actual = parseSwitchBitfield(data.actualBitfield);
            this.brightness = data.brightness;
        }
    }

    createData(dataState: DataState): BaseSystemMessage | undefined {
        switch (dataState) {
        case DataState.Spawn:
        case DataState.Update:
            return new SwitchSystemDataMessage(
                createSwitchBitfield(this.expected),
                createSwitchBitfield(this.actual),
                this.brightness,
            );
        }
        return undefined;
    }
    
    parseUpdate(reader: HazelReader): BaseSystemMessage | undefined {
        return SwitchSystemMessage.deserializeFromReader(reader);
    }

    async _handleUpdate(player: Player<RoomType>, message: BaseSystemMessage): Promise<void> {
        if (message instanceof SwitchSystemMessage) {
            if (message.isBitfield) {
                this.actual = parseSwitchBitfield(message.flipSwitches);
            } else {
                this.actual[message.flipSwitches] = !this.actual[message.flipSwitches];
            }
            this.pushDataUpdate();
        }
    }
    
    async processFixedUpdate(deltaSeconds: number): Promise<void> {
        this.updateCooldown -= deltaSeconds;
        if (this.updateCooldown <= 0) {
            this.updateCooldown = SwitchSystem.updateCooldownDuration;
            if (this.isSabotaged()) {
                if (this.brightness > SwitchSystem.minBrightness) {
                    this.brightness = Math.max(this.brightness - SwitchSystem.brightnessChangePerTick, 0);
                    this.pushDataUpdate();
                }
            } else {
                if (this.brightness < SwitchSystem.maxBrightness) {
                    this.brightness = Math.max(this.brightness + SwitchSystem.brightnessChangePerTick, 0);
                    this.pushDataUpdate();
                }
            }
        }
    }

    isCritical(): boolean {
        return false;
    }

    isSabotaged() {
        return this.actual[0] !== this.expected[0]
            || this.actual[1] !== this.expected[1]
            || this.actual[2] !== this.expected[2]
            || this.actual[3] !== this.expected[3]
            || this.actual[4] !== this.expected[4];
    }

    async _sabotageWithAuth(): Promise<void> {
        for (let i = 0; i < this.actual.length; i++) {
            if (Math.random() > SwitchSystem.flipChance || i == SwitchSystem.alwaysFlipSwitch) {
                this.actual[i] = !this.actual[i];
            }
        }
        this.pushDataUpdate();
    }
    
    
    async _fullyRepairWithAuth(): Promise<void> {
        this.actual = [...this.expected];
        this.pushDataUpdate();
    }

    async fullyRepairRequest(): Promise<void> {
        // TODO: implement
    }
}
