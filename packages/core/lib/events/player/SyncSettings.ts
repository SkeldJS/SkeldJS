import { BasicEvent } from "@skeldjs/events";
import { AllGameOptions, GameOptions, SyncSettingsMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

export class PlayerSyncSettingsEvent extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.syncsettings" as const;
    eventName = "player.syncsettings" as const;

    private _alteredSettings: GameOptions;
    private _isDirty: boolean;

    constructor(
        public readonly room: Hostable,
        public readonly player: PlayerData,
        public readonly message: SyncSettingsMessage|undefined,
        public readonly settings: GameOptions
    ) {
        super();

        this._alteredSettings = new GameOptions(settings);
        this._isDirty = false;
    }

    get alteredSettings() {
        return this._alteredSettings;
    }

    get isDirty() {
        return this._isDirty;
    }

    setSettings(options: Partial<AllGameOptions>) {
        this._alteredSettings.patch(options);
        this._isDirty = true;
    }
}
