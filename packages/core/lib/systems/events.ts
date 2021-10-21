import { ExtractEventTypes } from "@skeldjs/events";
import { SystemRepairEvent, SystemSabotageEvent } from "../events";
import { Hostable } from "../Hostable";
import { DoorEvents } from "../misc/Door";

import { AutoDoorsSystem } from "./AutoDoorsSystem";
import { DeconSystem } from "./DeconSystem";
import { DoorsSystem } from "./DoorsSystem";
import { HeliSabotageSystem } from "./HeliSabotageSystem";
import { HqHudSystem } from "./HqHudSystem";
import { HudOverrideSystem } from "./HudOverrideSystem";
import { LifeSuppSystem } from "./LifeSuppSystem";
import { MedScanSystem } from "./MedScanSystem";
import { ReactorSystem } from "./ReactorSystem";
import { SabotageSystem } from "./SabotageSystem";
import { SecurityCameraSystem } from "./SecurityCameraSystem";
import { SwitchSystem } from "./SwitchSystem";

export type SystemStatusEvents<RoomType extends Hostable = Hostable> = DoorEvents<RoomType> &
    ExtractEventTypes<[SystemSabotageEvent<RoomType>, SystemRepairEvent<RoomType>]>;

export type AnySystem<RoomType extends Hostable = Hostable> =
    | AutoDoorsSystem<RoomType>
    | DeconSystem<RoomType>
    | DoorsSystem<RoomType>
    | HeliSabotageSystem<RoomType>
    | HqHudSystem<RoomType>
    | HudOverrideSystem<RoomType>
    | LifeSuppSystem<RoomType>
    | MedScanSystem<RoomType>
    | ReactorSystem<RoomType>
    | SabotageSystem<RoomType>
    | SecurityCameraSystem<RoomType>
    | SwitchSystem<RoomType>;
