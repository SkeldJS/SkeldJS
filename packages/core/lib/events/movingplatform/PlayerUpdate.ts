import { RevertableEvent } from "@skeldjs/events";
import { RepairSystemMessage } from "@skeldjs/protocol";
import { RoomEvent } from "../RoomEvent";
import { Hostable } from "../../Hostable";
import { PlayerData } from "../../PlayerData";
import { MovingPlatformSide, MovingPlatformSystem } from "../../systems";
import { ProtocolEvent } from "../ProtocolEvent";
import { MovingPlatformEvent } from "./MovingPlatformEvent";

/**
 * Emitted when the player on a moving platform is updated. This is also when
 * the moving platform moves left or right.
 */
export class MovingPlatformPlayerUpdateEvent<RoomType extends Hostable = Hostable> extends RevertableEvent implements RoomEvent, MovingPlatformEvent, ProtocolEvent {
    static eventName = "movingplatform.updateplayer" as const;
    eventName = "movingplatform.updateplayer" as const;

    private _alteredPlayer: PlayerData<RoomType>|undefined;
    private _alteredSide: MovingPlatformSide;

    constructor(
        public readonly room: RoomType,
        public readonly movingplatform: MovingPlatformSystem<RoomType>,
        public readonly message: RepairSystemMessage|undefined,
        /**
         * The player on the moving platform, if any.
         */
        public readonly player: PlayerData<RoomType>|undefined,
        /**
         * The direction that the moving platform is moving in.
         */
        public readonly side: MovingPlatformSide
    ) {
        super();

        this._alteredPlayer = player;
        this._alteredSide = side;
    }

    /**
     * The altered player that will be on the moving platform, if changed.
     */
    get alteredPlayer() {
        return this._alteredPlayer;
    }

    /**
     * The altered direction that the moving platfomr will move in, if changed.
     */
    get alteredSide() {
        return this._alteredSide;
    }

    /**
     * Change the player that is on the moving platform.
     * @param player The player to get onto the moving platform.
     */
    setPlayer(player: PlayerData<RoomType>|undefined) {
        this._alteredPlayer = player;
    }

    /**
     * Change the direction that the moving platform is moving in.
     * @param side The direction for the moving platform to move.
     */
    setSide(side: MovingPlatformSide) {
        this._alteredSide = side;
    }
}
