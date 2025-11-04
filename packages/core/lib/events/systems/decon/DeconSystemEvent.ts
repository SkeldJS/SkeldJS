import { DeconSystemDataMessage, DeconSystemMessage } from "@skeldjs/au-protocol";
import { DeconSystem } from "../../../systems";
import { StatefulRoom } from "../../../StatefulRoom";

export interface DeconSystemEvent<RoomType extends StatefulRoom> {
    system: DeconSystem<RoomType>;
    originMessage: DeconSystemDataMessage|DeconSystemMessage|null;
}