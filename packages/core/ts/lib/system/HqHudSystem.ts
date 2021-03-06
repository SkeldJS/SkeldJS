import { HazelBuffer } from "@skeldjs/util";

import { SystemType } from "@skeldjs/constant";

import { BaseShipStatus } from "../component";
import { SystemStatus } from "./SystemStatus";
import { PlayerData } from "../PlayerData";
import { BaseSystemStatusEvents } from "./events";

export interface UserConsolePair {
    playerId: number;
    consoleId: number;
}

export interface HqHudSystemData {
    active: UserConsolePair[];
    completed: Set<number>;
}

export type HqHudSystemEvents = BaseSystemStatusEvents & {
    "hqhud.consoles.reset": {};
    "hqhud.consoles.open": { player: PlayerData; consoleId: number };
    "hqhud.consoles.close": { player: PlayerData; consoleId: number };
    "hqhud.consoles.complete": { player?: PlayerData; consoleId: number };
};

export enum HqHudSystemRepairTag {
    CompleteConsole = 0x10,
    CloseConsole = 0x20,
    OpenConsole = 0x40,
    Sabotage = 0x80,
}

export class HqHudSystem extends SystemStatus<HqHudSystemData, HqHudSystemEvents> {
    static systemType = SystemType.Communications as const;
    systemType = SystemType.Communications as const;

    timer: number;

    active: UserConsolePair[];
    completed: Set<number>;

    get sabotaged() {
        return this.completed.size < 2;
    }

    constructor(ship: BaseShipStatus, data?: HazelBuffer | HqHudSystemData) {
        super(ship, data);
    }

    private _getIdx(consoleId: number, playerId: number) {
        return this.active.findIndex(
            (pair) => pair.consoleId === consoleId && pair.playerId === playerId
        );
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean) {
        const num_active = reader.upacked();

        const before_active = this.active;
        this.active = [];
        for (let i = 0; i < num_active; i++) {
            const playerId = reader.uint8();
            const consoleId = reader.uint8();

            const player = this.ship.room.getPlayerByPlayerId(playerId);
            if (player) {
                this._openConsole(consoleId, player);
            }
        }

        for (let i = 0; i < before_active.length; i++) {
            const console = before_active[i];
            const idx = this._getIdx(console.consoleId, console.playerId);
            const player = this.ship.room.getPlayerByPlayerId(console.playerId);
            if (player && idx === -1) {
                this._closeConsole(console.consoleId, player);
            }
        }

        const num_completed = reader.upacked();
        for (let i = 0; i < num_completed; i++) {
            this._completeConsole(reader.uint8());
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean) {
        writer.upacked(this.active.length);

        for (let i = 0; i < this.active.length; i++) {
            const active = this.active[i];

            writer.uint8(active.playerId);
            writer.uint8(active.consoleId);
        }

        const completed = [...this.completed];
        writer.upacked(completed.length);

        for (let i = 0; i < completed.length; i++) {
            writer.uint8(completed[i]);
        }
    }

    HandleSabotage(player: PlayerData) {
        this.HandleRepair(player, 0x80);
    }

    private _resetConsoles() {
        this.completed.clear();
        this.dirty = true;
        this.emit("hqhud.consoles.reset", {});
    }

    private _openConsole(consoleId: number, player: PlayerData) {
        const idx = this._getIdx(consoleId, player.playerId);

        if (idx === -1) {
            this.active.push({ consoleId, playerId: player.playerId });
            this.dirty = true;
            this.emit("hqhud.consoles.open", { player, consoleId });
        }
    }

    private _closeConsole(consoleId: number, player: PlayerData) {
        const idx = this._getIdx(consoleId, player.playerId);

        if (idx > -1) {
            this.active.push({ consoleId, playerId: player.playerId });
            this.dirty = true;
            this.emit("hqhud.consoles.close", { player, consoleId });
        }
    }

    private _completeConsole(consoleId: number, player?: PlayerData) {
        if (!this.completed.has(consoleId)) {
            this.completed.add(consoleId);
            this.dirty = true;
            this.emit("hqhud.consoles.complete", { player, consoleId });
        }
    }

    private _fix() {
        this.completed.add(0).add(1);
        this.emit("system.repair", {});
    }

    openConsole(consoleId: number) {
        this.repair(
            this.ship.room.me,
            (consoleId & 0xf) | HqHudSystemRepairTag.OpenConsole
        );
    }

    closeConsole(consoleId: number) {
        this.repair(
            this.ship.room.me,
            (consoleId & 0xf) | HqHudSystemRepairTag.CloseConsole
        );
    }

    completeConsole(consoleId: number) {
        this.repair(
            this.ship.room.me,
            (consoleId & 0xf) | HqHudSystemRepairTag.CompleteConsole
        );
    }

    fix() {
        this.repair(this.ship.room.me, HqHudSystemRepairTag.CompleteConsole);
        this.repair(
            this.ship.room.me,
            1 & HqHudSystemRepairTag.CompleteConsole
        );
    }

    HandleRepair(player: PlayerData, amount: number) {
        const consoleId = amount & 0xf;
        const tags = amount & 0xf0;

        switch (tags) {
            case HqHudSystemRepairTag.CompleteConsole:
                this._completeConsole(consoleId, player);
                if (this.completed.size >= 2) this._fix();
                break;
            case HqHudSystemRepairTag.CloseConsole:
                this._closeConsole(consoleId, player);
                break;
            case HqHudSystemRepairTag.OpenConsole:
                this._openConsole(consoleId, player);
                break;
            case HqHudSystemRepairTag.Sabotage:
                this.timer = -1;
                this.active.splice(0);
                this.completed.clear();
                this.dirty = true;
                this.emit("system.sabotage", {});
                break;
        }
    }

    Detoriorate(delta: number) {
        this.timer -= delta;
        if (this.timer < 0) {
            this.timer = 10;
            this.dirty = true;
            this._resetConsoles();
        }
    }
}
