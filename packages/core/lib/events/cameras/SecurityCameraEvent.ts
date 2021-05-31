import { SecurityCameraSystem } from "../../system/SecurityCameraSystem";

export interface SecurityCameraEvent {
    /**
     * The security cameras that the event is for.
     */
    security: SecurityCameraSystem;
}
