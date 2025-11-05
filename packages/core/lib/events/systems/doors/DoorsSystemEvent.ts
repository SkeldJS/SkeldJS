import { DoorsSystemDataMessage } from "@skeldjs/au-protocol";
import { DoorsSystem } from "../../../systems";
import { StatefulRoom } from "../../../StatefulRoom";

export interface DoorsSystemEvent<RoomType extends StatefulRoom> {
    system: DoorsSystem<RoomType>;
    originMessage: DoorsSystemDataMessage|null;
}