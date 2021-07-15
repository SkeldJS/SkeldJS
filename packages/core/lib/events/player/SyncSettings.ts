import { BasicEvent } from "@skeldjs/events";
import { AllGameSettings, GameSettings, SyncSettingsMessage } from "@skeldjs/protocol";

import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { ProtocolEvent } from "../ProtocolEvent";
import { RoomEvent } from "../RoomEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player (i.e. the host of the room) sets the settings of the room.
 */
export class PlayerSyncSettingsEvent<RoomType extends Hostable = Hostable> extends BasicEvent implements RoomEvent, PlayerEvent, ProtocolEvent {
    static eventName = "player.syncsettings" as const;
    eventName = "player.syncsettings" as const;

    private _alteredSettings: GameSettings;
    private _isDirty: boolean;

    constructor(
        public readonly room: RoomType,
        public readonly player: PlayerData<RoomType>,
        public readonly message: SyncSettingsMessage|undefined,
        /**
         * The settings that were set.
         */
        public readonly settings: GameSettings
    ) {
        super();

        this._alteredSettings = new GameSettings(settings);
        this._isDirty = false;
    }

    /**
     * The altered settings of the room that will be set, if changeed.
     */
    get alteredSettings() {
        return this._alteredSettings;
    }

    /**
     * Whether the {@link PlayerSyncSettingsEvent.alteredSettings} is different
     * from the {@link PlayerSyncSettingsEvent.settings}.
     */
    get isDirty() {
        return this._isDirty;
    }

    /**
     * Change the settings that were set.
     * @param settings The settings to set.
     */
    setSettings(settings: Partial<AllGameSettings>) {
        this._alteredSettings.patch(settings);
        this._isDirty = true;
    }
}
