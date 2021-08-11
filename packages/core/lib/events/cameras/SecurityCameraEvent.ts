import { SecurityCameraSystem } from "../../systems/SecurityCameraSystem";

export interface SecurityCameraEvent {
    /**
     * The security cameras that the event is for.
     */
    security: SecurityCameraSystem;
}
