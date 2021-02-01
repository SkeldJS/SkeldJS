import { AutoDoorsSystemEvents } from "./AutoDoorsSystem";
import { DeconSystemEvents } from "./DeconSystem";
import { DoorsSystemEvents } from "./DoorsSystem";
import { HqHudSystemEvents } from "./HqHudSystem";
import { HudOverrideSystemEvents } from "./HudOverrideSystem";
import { LifeSuppSystemEvents } from "./LifeSuppSystem";
import { MedScanSystemEvents } from "./MedScanSystem";
import { ReactorSystemEvents } from "./ReactorSystem";
import { SabotageSystemEvents } from "./SabotageSystem";
import { SecurityCameraSystemEvents } from "./SecurityCameraSystem";
import { SwitchSystemEvents } from "./SwitchSystem";

export type SystemStatusEvents = AutoDoorsSystemEvents &
    DeconSystemEvents &
    DoorsSystemEvents &
    HqHudSystemEvents &
    HudOverrideSystemEvents &
    LifeSuppSystemEvents &
    MedScanSystemEvents &
    ReactorSystemEvents &
    SabotageSystemEvents &
    SecurityCameraSystemEvents &
    SwitchSystemEvents &
    {
        sabotageSystem: () => void;
        repairSystem: () => void;
    }
