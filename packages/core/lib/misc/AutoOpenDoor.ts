import { Hostable } from "../Hostable";
import { AutoDoorsSystem } from "../systems";
import { Door } from "./Door";

/**
 * Represents an auto opening door for the {@link AutoDoorsSystem}.
 *
 * See {@link DoorEvents} for events to listen to.
 */
export class AutoOpenDoor<RoomType extends Hostable = Hostable> extends Door {
    timer: number;

    constructor(
        protected system: AutoDoorsSystem<RoomType>,
        readonly doorId: number,
        isOpen: boolean
    ) {
        super(system, doorId, isOpen);

        this.timer = 0;
    }

    DoUpdate(delta: number) {
        this.timer -= delta;

        if (this.timer < 0) {
            this.system.openDoor(this.doorId);
            return true;
        }
        return false;
    }
}
