import { StatefulRoom } from "../../StatefulRoom";
import { SecurityCameraSystem } from "../../systems/SecurityCameraSystem";
import { RoomEvent } from "../RoomEvent";

export interface SecurityCameraEvent<RoomType extends StatefulRoom> extends RoomEvent<RoomType> {
    /**
     * The security cameras that the event is for.
     */
    security: SecurityCameraSystem<RoomType>;
}
