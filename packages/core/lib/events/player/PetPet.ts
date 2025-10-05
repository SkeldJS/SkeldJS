import { CancelableEvent } from "@skeldjs/events";
import { PetMessage } from "@skeldjs/protocol";
import { Vector2 } from "@skeldjs/util";
import { StatefulRoom } from "../../StatefulRoom";
import { Player } from "../../Player";
import { ProtocolEvent } from "../ProtocolEvent";
import { PlayerEvent } from "./PlayerEvent";

/**
 * Emitted when a player pets their pet or another player's pet.
 *
 * Due to technical limitations, the actual pet that is being petted is not
 * available.
 */
export class PlayerPetPetEvent<RoomType extends StatefulRoom> extends CancelableEvent implements PlayerEvent<RoomType>, ProtocolEvent {
    static eventName = "player.pet" as const;
    eventName = "player.pet" as const;

    constructor(
        public readonly room: RoomType,
        public readonly player: Player<RoomType>,
        public readonly message: PetMessage | undefined,
        public readonly playerPos: Vector2,
        public readonly petPos: Vector2
    ) {
        super();
    }
}
