import { SwitchSystemDataMessage, SwitchSystemMessage } from "@skeldjs/au-protocol";
import { SwitchSystem } from "../../../systems";
import { StatefulRoom } from "../../../StatefulRoom";

export interface SwitchSystemEvent<RoomType extends StatefulRoom> {
    system: SwitchSystem<RoomType>;
    originMessage: SwitchSystemDataMessage|SwitchSystemMessage|null;
}