import { ExtractEventTypes } from "@skeldjs/events";
import { SystemRepairEvent, SystemSabotageEvent } from "../events";
import { DoorEvents } from "../misc/Door";

import { AutoDoorsSystem } from "./AutoDoorsSystem";
import { DeconSystem } from "./DeconSystem";
import { DoorsSystem } from "./DoorsSystem";
import { HqHudSystem } from "./HqHudSystem";
import { HudOverrideSystem } from "./HudOverrideSystem";
import { LifeSuppSystem } from "./LifeSuppSystem";
import { MedScanSystem } from "./MedScanSystem";
import { ReactorSystem } from "./ReactorSystem";
import { SabotageSystem } from "./SabotageSystem";
import { SecurityCameraSystem } from "./SecurityCameraSystem";
import { SwitchSystem } from "./SwitchSystem";

export type SystemStatusEvents = DoorEvents &
    ExtractEventTypes<[SystemSabotageEvent, SystemRepairEvent]>;

export type AnySystem =
    | AutoDoorsSystem
    | DeconSystem
    | DoorsSystem
    | HqHudSystem
    | HudOverrideSystem
    | LifeSuppSystem
    | MedScanSystem
    | ReactorSystem
    | SabotageSystem
    | SecurityCameraSystem
    | SwitchSystem;
