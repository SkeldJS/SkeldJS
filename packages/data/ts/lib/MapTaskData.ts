import { TaskLength, TaskType, MapID, TheSkeldTask, MiraHQTask, PolusTask } from "@skeldjs/constant";

import { Vector2 } from "@skeldjs/util"

interface TaskDataModel {
    id: number;
    name: string;
    type: TaskType;
    length: TaskLength;
    visual: boolean;
    consoles: Vector2[];
}

export const MapTaskData: Record<MapID, Record<number, TaskDataModel>> = {
    [MapID.TheSkeld]: {
        [TheSkeldTask.AdminSwipeCard]: {
            id: TheSkeldTask.AdminSwipeCard,
            name: "Admin: Swipe Card",
            type: TaskType.SwipeCard,
            length: TaskLength.Common,
            visual: false,
            consoles: [{
                x: 4.5,
                y: -8.6
            }]
        },
        [TheSkeldTask.ElectricalFixWiring]: {
            id: TheSkeldTask.ElectricalFixWiring,
            name: "Electrical: Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: [{
                x: -7.7,
                y: -7.7
            }, {
                x: 14.5,
                y: -3.8
            }, {
                x: -15.6,
                y: -4.6
            }, {
                x: -1.9,
                y: -8.7
            }, {
                x: 1.4,
                y: -6.4
            }, {
                x: -5.3,
                y: 5.2
            }]
        },
        [TheSkeldTask.WeaponsClearAsteroids]: {
            id: TheSkeldTask.WeaponsClearAsteroids,
            name: "Weapons: Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Long,
            visual: true,
            consoles: [{
                x: 9.1,
                y: 1.8
            }]
        },
        [TheSkeldTask.EnginesAlignEngineOutput]: {
            id: TheSkeldTask.EnginesAlignEngineOutput,
            name: "Engines: Align Engine Output",
            type: TaskType.AlignEngineOutput,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -19.2,
                y: -12.6
            }]
        },
        [TheSkeldTask.MedBaySubmitScan]: {
            id: TheSkeldTask.MedBaySubmitScan,
            name: "MedBay: Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Long,
            visual: true,
            consoles: [{
                x: -7.3,
                y: -5.2
            }]
        },
        [TheSkeldTask.MedBayInspectSample]: {
            id: TheSkeldTask.MedBayInspectSample,
            name: "MedBay: Inspect Sample",
            type: TaskType.InspectSample,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: -6.1,
                y: -4.3
            }]
        },
        [TheSkeldTask.StorageFuelEngines]: {
            id: TheSkeldTask.StorageFuelEngines,
            name: "Storage: Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: -2.8,
                y: -13.9
            }]
        },
        [TheSkeldTask.ReactorStartReactor]: {
            id: TheSkeldTask.ReactorStartReactor,
            name: "Reactor: Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: -21.8,
                y: -5.6
            }]
        },
        [TheSkeldTask.O2EmptyChute]: {
            id: TheSkeldTask.O2EmptyChute,
            name: "O2: Empty Chute",
            type: TaskType.EmptyChute,
            length: TaskLength.Long,
            visual: true,
            consoles: [{
                x: 4.9,
                y: -3.3
            }]
        },
        [TheSkeldTask.CafeteriaEmptyGarbage]: {
            id: TheSkeldTask.CafeteriaEmptyGarbage,
            name: "Cafeteria: Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Long,
            visual: true,
            consoles: [{
                x: 4.5,
                y: 3.9
            }, {
                x: 0.8,
                y: -16.7
            }]
        },
        [TheSkeldTask.CommunicationsDownloadData]: {
            id: TheSkeldTask.CommunicationsDownloadData,
            name: "Communications: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 2.5,
                y: -6.3
            }, {
                x: 3.5,
                y: 4.9
            }, {
                x: 17.0,
                y: -2.4
            }, {
                x: 8.7,
                y: 3.9
            }, {
                x: -9.7,
                y: -7.3
            }, {
                x: 3.9,
                y: -14.0
            }]
        },
        [TheSkeldTask.ElectricalCalibrateDistributor]: {
            id: TheSkeldTask.ElectricalCalibrateDistributor,
            name: "Electrical: Calibrate Distributor",
            type: TaskType.CalibrateDistributor,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -5.9,
                y: -7.5
            }]
        },
        [TheSkeldTask.NavigationChartCourse]: {
            id: TheSkeldTask.NavigationChartCourse,
            name: "Navigation: Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 18.1,
                y: -3.3
            }]
        },
        [TheSkeldTask.O2CleanO2Filter]: {
            id: TheSkeldTask.O2CleanO2Filter,
            name: "O2: Clean O2 Filter",
            type: TaskType.CleanO2Filter,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 5.7,
                y: -3.0
            }]
        },
        [TheSkeldTask.ReactorUnlockManifolds]: {
            id: TheSkeldTask.ReactorUnlockManifolds,
            name: "Reactor: Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -22.5,
                y: -2.5
            }]
        },
        [TheSkeldTask.ElectricalDownloadData]: {
            id: TheSkeldTask.ElectricalDownloadData,
            name: "Electrical: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 2.5,
                y: -6.3
            }, {
                x: 3.5,
                y: 4.9
            }, {
                x: 17.0,
                y: -2.4
            }, {
                x: 8.7,
                y: 3.9
            }, {
                x: -9.7,
                y: -7.3
            }, {
                x: 3.9,
                y: -14.0
            }]
        },
        [TheSkeldTask.NavigationStabilizeSteering]: {
            id: TheSkeldTask.NavigationStabilizeSteering,
            name: "Navigation: Stabilize Steering",
            type: TaskType.StabilizeSteering,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 18.7,
                y: -4.7
            }]
        },
        [TheSkeldTask.WeaponsDownloadData]: {
            id: TheSkeldTask.WeaponsDownloadData,
            name: "Weapons: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 2.5,
                y: -6.3,
            }, {
                x: 3.5,
                y: 4.9
            }, {
                x: 17.0,
                y: -2.4
            }, {
                x: 8.7,
                y: 3.9
            }, {
                x: -9.7,
                y: -7.3
            }, {
                x: 3.9,
                y: -14.0
            }]
        },
        [TheSkeldTask.ShieldsPrimeShields]: {
            id: TheSkeldTask.ShieldsPrimeShields,
            name: "Shields: Prime Shields",
            type: TaskType.PrimeShields,
            length: TaskLength.Short,
            visual: true,
            consoles: [{
                x: 7.5,
                y: -14.0
            }]
        },
        [TheSkeldTask.CafeteriaDownloadData]: {
            id: TheSkeldTask.CafeteriaDownloadData,
            name: "Cafeteria: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 2.5,
                y: -6.3
            }, {
                x: 3.5,
                y: 4.9
            }, {
                x: 17.0,
                y: -2.4
            }, {
                x: 8.7,
                y: 3.9
            }, {
                x: -9.7,
                y: -7.3
            }, {
                x: 3.9,
                y: -14.0
            }]
        },
        [TheSkeldTask.NavigationDownloadData]: {
            id: TheSkeldTask.NavigationDownloadData,
            name: "Navigation: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 2.5,
                y: -6.3
            }, {
                x: 3.5,
                y: 4.9
            }, {
                x: 17.0,
                y: -2.4
            }, {
                x: 8.7,
                y: 3.9
            }, {
                x: -9.7,
                y: -7.3
            }, {
                x: 3.9,
                y: -14.0
            }]
        },
        [TheSkeldTask.ElectricalDivertPowerToShields]: {
            id: TheSkeldTask.ElectricalDivertPowerToShields,
            name: "Electrical: Divert Power to Shields",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: -2.4
            }, {
                x: 11.4,
                y: 2.1
            }, {
                x: 8.4,
                y: -2.5
            }, {
                x: 10.7,
                y: -10.1
            }, {
                x: -9.0,
                y: -7.3
            }, {
                x: -18.0,
                y: -9.3
            }, {
                x: -17.2,
                y: -3.1
            }, {
                x: 6.2,
                y: -14.1
            }, {
                x: -12.1,
                y: -3.1
            }]
        },
        [TheSkeldTask.ElectricalDivertPowerToWeapons]: {
            id: TheSkeldTask.ElectricalDivertPowerToWeapons,
            name: "Electrical: Divert Power to Weapons",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: -2.4
            }, {
                x: 11.4,
                y: 2.1
            }, {
                x: 8.4,
                y: -2.5
            }, {
                x: 10.7,
                y: -10.1
            }, {
                x: -9.0,
                y: -7.3
            }, {
                x: -18.0,
                y: -9.3
            }, {
                x: -17.2,
                y: -3.1
            }, {
                x: 6.2,
                y: -14.1
            }, {
                x: -12.1,
                y: -3.1
            }]
        },
        [TheSkeldTask.ElectricalDivertPowerToCommunications]: {
            id: TheSkeldTask.ElectricalDivertPowerToCommunications,
            name: "Electrical: Divert Power to Communications",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: -2.4
            }, {
                x: 11.4,
                y: 2.1
            }, {
                x: 8.4,
                y: -2.5
            }, {
                x: 10.7,
                y: -10.1
            }, {
                x: -9.0,
                y: -7.3
            }, {
                x: -18.0,
                y: -9.3
            }, {
                x: -17.2,
                y: -3.1
            }, {
                x: 6.2,
                y: -14.1
            }, {
                x: -12.1,
                y: -3.1
            }]
        },
        [TheSkeldTask.ElectricalDivertPowerToUpperEngine]: {
            id: TheSkeldTask.ElectricalDivertPowerToUpperEngine,
            name: "Electrical: Divert Power to Upper Engine",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: -2.4
            }, {
                x: 11.4,
                y: 2.1
            }, {
                x: 8.4,
                y: -2.5
            }, {
                x: 10.7,
                y: -10.1
            }, {
                x: -9.0,
                y: -7.3
            }, {
                x: -18.0,
                y: -9.3
            }, {
                x: -17.2,
                y: -3.1
            }, {
                x: 6.2,
                y: -14.1
            }, {
                x: -12.1,
                y: -3.1
            }]
        },
        [TheSkeldTask.ElectricalDivertPowerToO2]: {
            id: TheSkeldTask.ElectricalDivertPowerToO2,
            name: "Electrical: Divert Power to O2",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: -2.4
            }, {
                x: 11.4,
                y: 2.1
            }, {
                x: 8.4,
                y: -2.5
            }, {
                x: 10.7,
                y: -10.1
            }, {
                x: -9.0,
                y: -7.3
            }, {
                x: -18.0,
                y: -9.3
            }, {
                x: -17.2,
                y: -3.1
            }, {
                x: 6.2,
                y: -14.1
            }, {
                x: -12.1,
                y: -3.1
            }]
        },
        [TheSkeldTask.ElectricalDivertPowerToNavigation]: {
            id: TheSkeldTask.ElectricalDivertPowerToNavigation,
            name: "Electrical: Divert Power to Navigation",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: -2.4
            }, {
                x: 11.4,
                y: 2.1
            }, {
                x: 8.4,
                y: -2.5
            }, {
                x: 10.7,
                y: -10.1
            }, {
                x: -9.0,
                y: -7.3
            }, {
                x: -18.0,
                y: -9.3
            }, {
                x: -17.2,
                y: -3.1
            }, {
                x: 6.2,
                y: -14.1
            }, {
                x: -12.1,
                y: -3.1
            }]
        },
        [TheSkeldTask.ElectricalDivertPowerToLowerEngine]: {
            id: TheSkeldTask.ElectricalDivertPowerToLowerEngine,
            name: "Electrical: Divert Power to Lower Engine",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: -2.4
            }, {
                x: 11.4,
                y: 2.1
            }, {
                x: 8.4,
                y: -2.5
            }, {
                x: 10.7,
                y: -10.1
            }, {
                x: -9.0,
                y: -7.3
            }, {
                x: -18.0,
                y: -9.3
            }, {
                x: -17.2,
                y: -3.1
            }, {
                x: 6.2,
                y: -14.1
            }, {
                x: -12.1,
                y: -3.1
            }]
        },
        [TheSkeldTask.ElectricalDivertPowerToSecurity]: {
            id: TheSkeldTask.ElectricalDivertPowerToSecurity,
            name: "Electrical: Divert Power to Security",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: -2.4
            }, {
                x: 11.4,
                y: 2.1
            }, {
                x: 8.4,
                y: -2.5
            }, {
                x: 10.7,
                y: -10.1
            }, {
                x: -9.0,
                y: -7.3
            }, {
                x: -18.0,
                y: -9.3
            }, {
                x: -17.2,
                y: -3.1
            }, {
                x: 6.2,
                y: -14.1
            }, {
                x: -12.1,
                y: -3.1
            }]
        }
    },
    [MapID.MiraHQ]: {
        [MiraHQTask.HallwayFixWiring]: {
            id: MiraHQTask.HallwayFixWiring,
            name: "Hallway: Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: [{
                x: 18.4,
                y: 1.2
            }, {
                x: 12.1,
                y: 8.0
            }, {
                x: 6.1,
                y: 15.0
            }, {
                x: 4.4,
                y: 2.5
            }, {
                x: 17.0,
                y: 21.4
            }]
        },
        [MiraHQTask.AdminEnterIDCode]: {
            id: MiraHQTask.AdminEnterIDCode,
            name: "Admin: Enter ID Code",
            type: TaskType.EnterIdCode,
            length: TaskLength.Common,
            visual: false,
            consoles: [{
                x: 19.9,
                y: 19.0
            }]
        },
        [MiraHQTask.MedBaySubmitScan]: {
            id: MiraHQTask.MedBaySubmitScan,
            name: "MedBay: Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Long,
            visual: true,
            consoles: [{
                x: 16.2,
                y: 0.3
            }]
        },
        [MiraHQTask.BalconyClearAsteroids]: {
            id: MiraHQTask.BalconyClearAsteroids,
            name: "Balcony: Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 19.2,
                y: -2.4
            }]
        },
        [MiraHQTask.ElectricalDivertPowerToAdmin]: {
            id: MiraHQTask.ElectricalDivertPowerToAdmin,
            name: "Electrical: Divert Power to Admin",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.3,
                y: 0.9
            }, {
                x: 21.6,
                y: 5.8
            }, {
                x: 0.8,
                y: 11.5
            }, {
                x: 7.7,
                y: 14.9
            }, {
                x: 20.3,
                y: 21.4
            }, {
                x: 16.2,
                y: 20.0
            }, {
                x: 13.9,
                y: 22.9
            }, {
                x: 14.0,
                y: 5.9
            }, {
                x: 14.8,
                y: 2.0
            }]
        },
        [MiraHQTask.ElectricalDivertPowerToCafeteria]: {
            id: MiraHQTask.ElectricalDivertPowerToCafeteria,
            name: "Electrical: Divert Power to Cafeteria",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.3,
                y: 0.9
            }, {
                x: 21.6,
                y: 5.8
            }, {
                x: 0.8,
                y: 11.5
            }, {
                x: 7.7,
                y: 14.9
            }, {
                x: 20.3,
                y: 21.4
            }, {
                x: 16.2,
                y: 20.0
            }, {
                x: 13.9,
                y: 22.9
            }, {
                x: 14.0,
                y: 5.9
            }, {
                x: 14.8,
                y: 2.0
            }]
        },
        [MiraHQTask.ElectricalDivertPowerToCommunications]: {
            id: MiraHQTask.ElectricalDivertPowerToCommunications,
            name: "Electrical: Divert Power to Communications",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.3,
                y: 0.9
            }, {
                x: 21.6,
                y: 5.8
            }, {
                x: 0.8,
                y: 11.5
            }, {
                x: 7.7,
                y: 14.9
            }, {
                x: 20.3,
                y: 21.4
            }, {
                x: 16.2,
                y: 20.0
            }, {
                x: 13.9,
                y: 22.9
            }, {
                x: 14.0,
                y: 5.9
            }, {
                x: 14.8,
                y: 2.0
            }]
        },
        [MiraHQTask.ElectricalDivertPowerToLaunchpad]: {
            id: MiraHQTask.ElectricalDivertPowerToLaunchpad,
            name: "Electrical: Divert Power to Launchpad",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.3,
                y: 0.9
            }, {
                x: 21.6,
                y: 5.8
            }, {
                x: 0.8,
                y: 11.5
            }, {
                x: 7.7,
                y: 14.9
            }, {
                x: 20.3,
                y: 21.4
            }, {
                x: 16.2,
                y: 20.0
            }, {
                x: 13.9,
                y: 22.9
            }, {
                x: 14.0,
                y: 5.9
            }, {
                x: 14.8,
                y: 2.0
            }]
        },
        [MiraHQTask.ElectricalDivertPowerToMedBay]: {
            id: MiraHQTask.ElectricalDivertPowerToMedBay,
            name: "Electrical: Divert Power to MedBay",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.3,
                y: 0.9
            }, {
                x: 21.6,
                y: 5.8
            }, {
                x: 0.8,
                y: 11.5
            }, {
                x: 7.7,
                y: 14.9
            }, {
                x: 20.3,
                y: 21.4
            }, {
                x: 16.2,
                y: 20.0
            }, {
                x: 13.9,
                y: 22.9
            }, {
                x: 14.0,
                y: 5.9
            }, {
                x: 14.8,
                y: 2.0
            }]
        },
        [MiraHQTask.ElectricalDivertPowerToOffice]: {
            id: MiraHQTask.ElectricalDivertPowerToOffice,
            name: "Electrical: Divert Power to Office",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.3,
                y: 0.9
            }, {
                x: 21.6,
                y: 5.8
            }, {
                x: 0.8,
                y: 11.5
            }, {
                x: 7.7,
                y: 14.9
            }, {
                x: 20.3,
                y: 21.4
            }, {
                x: 16.2,
                y: 20.0
            }, {
                x: 13.9,
                y: 22.9
            }, {
                x: 14.0,
                y: 5.9
            }, {
                x: 14.8,
                y: 2.0
            }]
        },
        [MiraHQTask.StorageWaterPlants]: {
            id: MiraHQTask.StorageWaterPlants,
            name: "Storage: Water Plants",
            type: TaskType.WaterPlants,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 19.6,
                y: 5.2
            }, {
                x: 20.5,
                y: 22.8
            }]
        },
        [MiraHQTask.ReactorStartReactor]: {
            id: MiraHQTask.ReactorStartReactor,
            name: "Reactor: Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 2.5,
                y: 12.4
            }]
        },
        [MiraHQTask.ElectricalDivertPowerToGreenhouse]: {
            id: MiraHQTask.ElectricalDivertPowerToGreenhouse,
            name: "Electrical: Divert Power to Greenhouse",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.3,
                y: 0.9
            }, {
                x: 21.6,
                y: 5.8
            }, {
                x: 0.8,
                y: 11.5
            }, {
                x: 7.7,
                y: 14.9
            }, {
                x: 20.3,
                y: 21.4
            }, {
                x: 16.2,
                y: 20.0
            }, {
                x: 13.9,
                y: 22.9
            }, {
                x: 14.0,
                y: 5.9
            }, {
                x: 14.8,
                y: 2.0
            }]
        },
        [MiraHQTask.AdminChartCourse]: {
            id: MiraHQTask.AdminChartCourse,
            name: "Admin: Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 22.2,
                y: 21.2
            }]
        },
        [MiraHQTask.GreenhouseCleanO2Filter]: {
            id: MiraHQTask.GreenhouseCleanO2Filter,
            name: "Greenhouse: Clean O2 Filter",
            type: TaskType.CleanO2Filter,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 17.2,
                y: 24.5
            }]
        },
        [MiraHQTask.LaunchpadFuelEngines]: {
            id: MiraHQTask.LaunchpadFuelEngines,
            name: "Launchpad: Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.4,
                y: 2.3
            }]
        },
        [MiraHQTask.LaboratoryAssembleArtifact]: {
            id: MiraHQTask.LaboratoryAssembleArtifact,
            name: "Laboratory: Assemble Artifact",
            type: TaskType.AssembleArtifact,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 9.4,
                y: 14.6
            }]
        },
        [MiraHQTask.LaboratorySortSamples]: {
            id: MiraHQTask.LaboratorySortSamples,
            name: "Laboratory: Sort Samples",
            type: TaskType.SortSamples,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 9.7,
                y: 11.1
            }]
        },
        [MiraHQTask.AdminPrimeShields]: {
            id: MiraHQTask.AdminPrimeShields,
            name: "Admin: Prime Shields",
            type: TaskType.PrimeShields,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 21.2,
                y: 17.9
            }]
        },
        [MiraHQTask.CafeteriaEmptyGarbage]: {
            id: MiraHQTask.CafeteriaEmptyGarbage,
            name: "Cafeteria: Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 25.3,
                y: 5.8
            }]
        },
        [MiraHQTask.BalconyMeasureWeather]: {
            id: MiraHQTask.BalconyMeasureWeather,
            name: "Balcony: Measure Weather",
            type: TaskType.MeasureWeather,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 28.9,
                y: -1.7
            }]
        },
        [MiraHQTask.ElectricalDivertPowerToLaboratory]: {
            id: MiraHQTask.ElectricalDivertPowerToLaboratory,
            name: "Electrical: Divert Power to Laboratory",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: -6.3,
                y: 0.9
            }, {
                x: 21.6,
                y: 5.8
            }, {
                x: 0.8,
                y: 11.5
            }, {
                x: 7.7,
                y: 14.9
            }, {
                x: 20.3,
                y: 21.4
            }, {
                x: 16.2,
                y: 20.0
            }, {
                x: 13.9,
                y: 22.9
            }, {
                x: 14.0,
                y: 5.9
            }, {
                x: 14.8,
                y: 2.0
            }]
        },
        [MiraHQTask.CafeteriaBuyBeverage]: {
            id: MiraHQTask.CafeteriaBuyBeverage,
            name: "Cafeteria: Buy Beverage",
            type: TaskType.BuyBeverage,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 27.5,
                y: 5.7
            }]
        },
        [MiraHQTask.OfficeProcessData]: {
            id: MiraHQTask.OfficeProcessData,
            name: "Office: Process Data",
            type: TaskType.ProcessData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 15.8,
                y: 21.4
            }]
        },
        [MiraHQTask.LaunchpadRunDiagnostics]: {
            id: MiraHQTask.LaunchpadRunDiagnostics,
            name: "Launchpad: Run Diagnostics",
            type: TaskType.RunDiagnostics,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: -2.5,
                y: 1.9
            }]
        },
        [MiraHQTask.ReactorUnlockManifolds]: {
            id: MiraHQTask.ReactorUnlockManifolds,
            name: "Reactor: Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 0.4,
                y: 13.3
            }]
        }
    },
    [MapID.Polus]: {
        [PolusTask.OfficeSwipeCard]: {
            id: PolusTask.OfficeSwipeCard,
            name: "Office: Swipe Card",
            type: TaskType.SwipeCard,
            length: TaskLength.Common,
            visual: false,
            consoles: [{
                x: 24.8,
                y: -16.2
            }]
        },
        [PolusTask.DropshipInsertKeys]: {
            id: PolusTask.DropshipInsertKeys,
            name: "Dropship: Insert Keys",
            type: TaskType.InsertKeys,
            length: TaskLength.Common,
            visual: false,
            consoles: [{
                x: 17.4,
                y: 0.1
            }]
        },
        [PolusTask.OfficeScanBoardingPass]: {
            id: PolusTask.OfficeScanBoardingPass,
            name: "Office: Scan Boarding Pass",
            type: TaskType.ScanBoardingPass,
            length: TaskLength.Common,
            visual: false,
            consoles: [{
                x: 25.8,
                y: -16.0
            }]
        },
        [PolusTask.ElectricalFixWiring]: {
            id: PolusTask.ElectricalFixWiring,
            name: "Electrical: Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: [{
                x: 3.1,
                y: -8.7
            }, {
                x: 6.5,
                y: -18.5
            }, {
                x: 16.4,
                y: -18.5
            }, {
                x: 40.6,
                y: -9.0
            }, {
                x: 37.3,
                y: -8.9
            }, {
                x: 33.0,
                y: -9.0
            }]
        },
        [PolusTask.WeaponsDownloadData]: {
            id: PolusTask.WeaponsDownloadData,
            name: "Weapons: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 6.6,
                y: -8.7
            }, {
                x: 2.9,
                y: -15.4
            }, {
                x: 13.9,
                y: -22.1
            }, {
                x: 11.7,
                y: -15.1
            }, {
                x: 27.7,
                y: -16.0
            }, {
                x: 37.7,
                y: -18.5
            }]
        },
        [PolusTask.OfficeDownloadData]: {
            id: PolusTask.OfficeDownloadData,
            name: "Office: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 6.6,
                y: -8.7
            }, {
                x: 2.9,
                y: -15.4
            }, {
                x: 13.9,
                y: -22.1
            }, {
                x: 11.7,
                y: -15.1
            }, {
                x: 27.7,
                y: -16.0
            }, {
                x: 37.7,
                y: -18.5
            }]
        },
        [PolusTask.ElectricalDownloadData]: {
            id: PolusTask.ElectricalDownloadData,
            name: "Electrical: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 6.6,
                y: -8.7
            }, {
                x: 2.9,
                y: -15.4
            }, {
                x: 13.9,
                y: -22.1
            }, {
                x: 11.7,
                y: -15.1
            }, {
                x: 27.7,
                y: -16.0
            }, {
                x: 37.7,
                y: -18.5
            }]
        },
        [PolusTask.SpecimenRoomDownloadData]: {
            id: PolusTask.SpecimenRoomDownloadData,
            name: "Specimen Room: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 6.6,
                y: -8.7
            }, {
                x: 2.9,
                y: -15.4
            }, {
                x: 13.9,
                y: -22.1
            }, {
                x: 11.7,
                y: -15.1
            }, {
                x: 27.7,
                y: -16.0
            }, {
                x: 37.7,
                y: -18.5
            }]
        },
        [PolusTask.O2DownloadData]: {
            id: PolusTask.O2DownloadData,
            name: "O2: Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 6.6,
                y: -8.7
            }, {
                x: 2.9,
                y: -15.4
            }, {
                x: 13.9,
                y: -22.1
            }, {
                x: 11.7,
                y: -15.1
            }, {
                x: 27.7,
                y: -16.0
            }, {
                x: 37.7,
                y: -18.5
            }]
        },
        [PolusTask.SpecimenRoomStartReactor]: {
            id: PolusTask.SpecimenRoomStartReactor,
            name: "Specimen Room: Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 34.8,
                y: -18.9
            }]
        },
        [PolusTask.StorageFuelEngines]: {
            id: PolusTask.StorageFuelEngines,
            name: "Storage: Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 21.1,
                y: -11.3
            }, {
                x: 11.4,
                y: -6.2
            }, {
                x: 22.0,
                y: -6.2
            }]
        },
        [PolusTask.BoilerRoomOpenWaterways]: {
            id: PolusTask.BoilerRoomOpenWaterways,
            name: "Boiler Room: Open Waterways",
            type: TaskType.OpenWaterways,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 3.7,
                y: -24.2
            }, {
                x: 0.9,
                y: -24.2
            }, {
                x: 18.4,
                y: -23.7
            }]
        },
        [PolusTask.MedBayInspectSample]: {
            id: PolusTask.MedBayInspectSample,
            name: "MedBay: Inspect Sample",
            type: TaskType.InspectSample,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 36.5,
                y: -5.6
            }]
        },
        [PolusTask.BoilerRoomReplaceWaterJug]: {
            id: PolusTask.BoilerRoomReplaceWaterJug,
            name: "Boiler Room: Replace Water Jug",
            type: TaskType.ReplaceWaterJug,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 1.2,
                y: -23.1
            }, {
                x: 16.8,
                y: -16.0
            }]
        },
        [PolusTask.OutsideFixWeatherNodeNODE_GI]: {
            id: PolusTask.OutsideFixWeatherNodeNODE_GI,
            name: "Outside: Fix Weather Node Node_GI",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 29.4,
                y: -6.8
            }, {
                x: 23.0,
                y: -6.9
            }, {
                x: 8.4,
                y: -15.5
            }, {
                x: 7.2,
                y: -25.4
            }, {
                x: 15.0,
                y: -25.4
            }, {
                x: 14.5,
                y: -12.2
            }, {
                x: 30.9,
                y: -12.2
            }]
        },
        [PolusTask.OutsideFixWeatherNodeNODE_IRO]: {
            id: PolusTask.OutsideFixWeatherNodeNODE_IRO,
            name: "Outside: Fix Weather Node Node_IRO",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 29.4,
                y: -6.8
            }, {
                x: 23.0,
                y: -6.9
            }, {
                x: 8.4,
                y: -15.5
            }, {
                x: 7.2,
                y: -25.4
            }, {
                x: 15.0,
                y: -25.4
            }, {
                x: 14.5,
                y: -12.2
            }, {
                x: 30.9,
                y: -12.2
            }]
        },
        [PolusTask.OutsideFixWeatherNodeNODE_PD]: {
            id: PolusTask.OutsideFixWeatherNodeNODE_PD,
            name: "Outside: Fix Weather Node Node_PD",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 29.4,
                y: -6.8
            }, {
                x: 23.0,
                y: -6.9
            }, {
                x: 8.4,
                y: -15.5
            }, {
                x: 7.2,
                y: -25.4
            }, {
                x: 15.0,
                y: -25.4
            }, {
                x: 14.5,
                y: -12.2
            }, {
                x: 30.9,
                y: -12.2
            }]
        },
        [PolusTask.OutsideFixWeatherNodeNODE_TB]: {
            id: PolusTask.OutsideFixWeatherNodeNODE_TB,
            name: "Outside: Fix Weather Node Node_TB",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 29.4,
                y: -6.8
            }, {
                x: 23.0,
                y: -6.9
            }, {
                x: 8.4,
                y: -15.5
            }, {
                x: 7.2,
                y: -25.4
            }, {
                x: 15.0,
                y: -25.4
            }, {
                x: 14.5,
                y: -12.2
            }, {
                x: 30.9,
                y: -12.2
            }]
        },
        [PolusTask.CommunicationsRebootWiFi]: {
            id: PolusTask.CommunicationsRebootWiFi,
            name: "Communications: Reboot WiFi",
            type: TaskType.RebootWifi,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 11.0,
                y: -15.3
            }]
        },
        [PolusTask.O2MonitorTree]: {
            id: PolusTask.O2MonitorTree,
            name: "O2: Monitor Tree",
            type: TaskType.MonitorO2,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 1.7,
                y: -16.0
            }]
        },
        [PolusTask.SpecimenRoomUnlockManifolds]: {
            id: PolusTask.SpecimenRoomUnlockManifolds,
            name: "Specimen Room: Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 34.4,
                y: -19.5
            }]
        },
        [PolusTask.SpecimenRoomStoreArtifacts]: {
            id: PolusTask.SpecimenRoomStoreArtifacts,
            name: "Specimen Room: Store Artifacts",
            type: TaskType.StoreArtifacts,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 36.5,
                y: -18.8
            }]
        },
        [PolusTask.O2FillCanisters]: {
            id: PolusTask.O2FillCanisters,
            name: "O2: Fill Canisters",
            type: TaskType.FillCanisters,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 1.1,
                y: -19.5
            }]
        },
        [PolusTask.O2EmptyGarbage]: {
            id: PolusTask.O2EmptyGarbage,
            name: "O2: Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 5.0,
                y: -20.7
            }]
        },
        [PolusTask.DropshipChartCourse]: {
            id: PolusTask.DropshipChartCourse,
            name: "Dropship: Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 16.0,
                y: 0.1
            }]
        },
        [PolusTask.MedBaySubmitScan]: {
            id: PolusTask.MedBaySubmitScan,
            name: "MedBay: Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Short,
            visual: true,
            consoles: [{
                x: 40.3,
                y: -7.1
            }]
        },
        [PolusTask.WeaponsClearAsteroids]: {
            id: PolusTask.WeaponsClearAsteroids,
            name: "Weapons: Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Short,
            visual: true,
            consoles: [{
                x: 9.9,
                y: -22.4
            }]
        },
        [PolusTask.OutsideFixWeatherNodeNODE_CA]: {
            id: PolusTask.OutsideFixWeatherNodeNODE_CA,
            name: "Outside: Fix Weather Node Node_CA",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 29.4,
                y: -6.8
            }, {
                x: 23.0,
                y: -6.9
            }, {
                x: 8.4,
                y: -15.5
            }, {
                x: 7.2,
                y: -25.4
            }, {
                x: 15.0,
                y: -25.4
            }, {
                x: 14.5,
                y: -12.2
            }, {
                x: 30.9,
                y: -12.2
            }]
        },
        [PolusTask.OutsideFixWeatherNodeNODE_MLG]: {
            id: PolusTask.OutsideFixWeatherNodeNODE_MLG,
            name: "Outside: Fix Weather Node Node_MLG",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            visual: false,
            consoles: [{
                x: 29.4,
                y: -6.8
            }, {
                x: 23.0,
                y: -6.9
            }, {
                x: 8.4,
                y: -15.5
            }, {
                x: 7.2,
                y: -25.4
            }, {
                x: 15.0,
                y: -25.4
            }, {
                x: 14.5,
                y: -12.2
            }, {
                x: 30.9,
                y: -12.2
            }]
        },
        [PolusTask.LaboratoryAlignTelescope]: {
            id: PolusTask.LaboratoryAlignTelescope,
            name: "Laboratory: Align Telescope",
            type: TaskType.AlignTelescope,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 33.9,
                y: -5.5
            }]
        },
        [PolusTask.LaboratoryRepairDrill]: {
            id: PolusTask.LaboratoryRepairDrill,
            name: "Laboratory: Repair Drill",
            type: TaskType.RepairDrill,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 27.4,
                y: -7.0
            }]
        },
        [PolusTask.LaboratoryRecordTemperature]: {
            id: PolusTask.LaboratoryRecordTemperature,
            name: "Laboratory: Record Temperature",
            type: TaskType.RecordTemperature,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 31.3,
                y: -6.7
            }, {
                x: 30.9,
                y: -15.3
            }]
        },
        [PolusTask.OutsideRecordTemperature]: {
            id: PolusTask.OutsideRecordTemperature,
            name: "Outside: Record Temperature",
            type: TaskType.RecordTemperature,
            length: TaskLength.Short,
            visual: false,
            consoles: [{
                x: 31.3,
                y: -6.7
            }, {
                x: 30.9,
                y: -15.3
            }]
        }
    },
    [MapID.Airship]: {}
};
