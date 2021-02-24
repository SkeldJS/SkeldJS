import { PlayerData } from "../PlayerData";
import { PropagatedEvents } from "../util/PropagatedEvents";
import { AutoDoorsSystem, AutoDoorsSystemEvents } from "./AutoDoorsSystem";
import { DeconSystem, DeconSystemEvents } from "./DeconSystem";
import { DoorsSystem, DoorsSystemEvents } from "./DoorsSystem";
import { HqHudSystem, HqHudSystemEvents } from "./HqHudSystem";
import { HudOverrideSystem, HudOverrideSystemEvents } from "./HudOverrideSystem";
import { LifeSuppSystem, LifeSuppSystemEvents } from "./LifeSuppSystem";
import { MedScanSystem, MedScanSystemEvents } from "./MedScanSystem";
import { ReactorSystem, ReactorSystemEvents } from "./ReactorSystem";
import { SabotageSystem, SabotageSystemEvents } from "./SabotageSystem";
import { SecurityCameraSystem, SecurityCameraSystemEvents } from "./SecurityCameraSystem";
import { SwitchSystem, SwitchSystemEvents } from "./SwitchSystem";

export type BaseSystemStatusEvents = {
    "system.sabotage": { player?: PlayerData };
    "system.repair": { player?: PlayerData };
}

type AnySystem = AutoDoorsSystem|DeconSystem|DoorsSystem|HqHudSystem|HudOverrideSystem|LifeSuppSystem|MedScanSystem|ReactorSystem|SabotageSystem|SecurityCameraSystem|SwitchSystem;

export type SystemStatusEvents =
    PropagatedEvents<Omit<AutoDoorsSystemEvents, keyof BaseSystemStatusEvents>, { system: AutoDoorsSystem }> &
    PropagatedEvents<Omit<DeconSystemEvents, keyof BaseSystemStatusEvents>, { system: DeconSystem }> &
    PropagatedEvents<Omit<DoorsSystemEvents, keyof BaseSystemStatusEvents>, { system: DoorsSystem }> &
    PropagatedEvents<Omit<HqHudSystemEvents, keyof BaseSystemStatusEvents>, { system: HqHudSystem }> &
    PropagatedEvents<Omit<HudOverrideSystemEvents, keyof BaseSystemStatusEvents>, { system: HudOverrideSystem }> &
    PropagatedEvents<Omit<LifeSuppSystemEvents, keyof BaseSystemStatusEvents>, { system: LifeSuppSystem }> &
    PropagatedEvents<Omit<MedScanSystemEvents, keyof BaseSystemStatusEvents>, { system: MedScanSystem }> &
    PropagatedEvents<Omit<ReactorSystemEvents, keyof BaseSystemStatusEvents>, { system: ReactorSystem }> &
    PropagatedEvents<Omit<SabotageSystemEvents, keyof BaseSystemStatusEvents>, { system: SabotageSystem }> &
    PropagatedEvents<Omit<SecurityCameraSystemEvents, keyof BaseSystemStatusEvents>, { system: SecurityCameraSystem }> &
    PropagatedEvents<Omit<SwitchSystemEvents, keyof BaseSystemStatusEvents>, { system: SwitchSystem }> &
    PropagatedEvents<BaseSystemStatusEvents, { system: AnySystem }> ;
