import {
    TaskLength,
    TaskType,
    MapID,
    AirshipTask,
    TheSkeldTask,
    MiraHQTask,
    PolusTask,
} from "@skeldjs/constant";

interface ConsoleDataModel {
    id: number;
    name: string;
    position: {
        x: number;
        y: number;
    };
}

interface TaskDataModel {
    name: string;
    type: TaskType;
    length: TaskLength;
    visual: boolean;
    consoles: Record<number, ConsoleDataModel>;
}

export const MapTaskData: Record<MapID, Record<number, TaskDataModel>> = {
    [MapID.TheSkeld]: {
        [TaskType.SwipeCard]: {
            name: "Swipe Card",
            type: TaskType.SwipeCard,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [TheSkeldTask.AdminSwipeCard]: {
                    id: 0,
                    name: "Admin: Swipe Card",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [TheSkeldTask.ElectricalFixWiring]: {
                    id: 1,
                    name: "Electrical: Fix Wiring",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Long,
            visual: true,
            consoles: {
                [TheSkeldTask.WeaponsClearAsteroids]: {
                    id: 2,
                    name: "Weapons: Clear Asteroids",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.AlignEngineOutput]: {
            name: "Align Engine Output",
            type: TaskType.AlignEngineOutput,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [TheSkeldTask.EnginesAlignEngineOutput]: {
                    id: 3,
                    name: "Engines: Align Engine Output",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Long,
            visual: true,
            consoles: {
                [TheSkeldTask.MedBaySubmitScan]: {
                    id: 4,
                    name: "Medbay: Submit Scan",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.InspectSample]: {
            name: "Inspect Sample",
            type: TaskType.InspectSample,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [TheSkeldTask.MedBayInspectSample]: {
                    id: 5,
                    name: "Medbay: Inspect Sample",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.FuelEngines]: {
            name: "Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [TheSkeldTask.StorageFuelEngines]: {
                    id: 6,
                    name: "Storage: Fuel Engines",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [TheSkeldTask.ReactorStartReactor]: {
                    id: 7,
                    name: "Reactor: Start Reactor",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.EmptyChute]: {
            name: "Empty Chute",
            type: TaskType.EmptyChute,
            length: TaskLength.Long,
            visual: true,
            consoles: {
                [TheSkeldTask.O2EmptyChute]: {
                    id: 8,
                    name: "O2: Empty Chute",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.EmptyGarbage]: {
            name: "Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Long,
            visual: true,
            consoles: {
                [TheSkeldTask.CafeteriaEmptyGarbage]: {
                    id: 9,
                    name: "Cafeteria: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.UploadData]: {
            name: "Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [TheSkeldTask.CommunicationsDownloadData]: {
                    id: 10,
                    name: "Communications: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.ElectricalDownloadData]: {
                    id: 15,
                    name: "Electrical: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.WeaponsDownloadData]: {
                    id: 17,
                    name: "Weapons: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.CafeteriaDownloadData]: {
                    id: 19,
                    name: "Cafeteria: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.NavigationDownloadData]: {
                    id: 20,
                    name: "Navigation: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.CalibrateDistributor]: {
            name: "Calibrate Distributor",
            type: TaskType.CalibrateDistributor,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [TheSkeldTask.ElectricalCalibrateDistributor]: {
                    id: 11,
                    name: "Electrical: Calibrate Distributor",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ChartCourse]: {
            name: "Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [TheSkeldTask.NavigationChartCourse]: {
                    id: 12,
                    name: "Navigation: Chart Course",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.CleanO2Filter]: {
            name: "Clean O2 Filter",
            type: TaskType.CleanO2Filter,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [TheSkeldTask.O2CleanO2Filter]: {
                    id: 13,
                    name: "O2: Clean O2 Filter",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [TheSkeldTask.ReactorUnlockManifolds]: {
                    id: 14,
                    name: "Reactor: Unlock Manifolds",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.StabilizeSteering]: {
            name: "Stabilize Steering",
            type: TaskType.StabilizeSteering,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [TheSkeldTask.NavigationStabilizeSteering]: {
                    id: 16,
                    name: "Navigation: Stabilize Steering",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.PrimeShields]: {
            name: "Prime Shields",
            type: TaskType.PrimeShields,
            length: TaskLength.Short,
            visual: true,
            consoles: {
                [TheSkeldTask.ShieldsPrimeShields]: {
                    id: 18,
                    name: "Shields: Prime Shields",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.DivertPower]: {
            name: "Divert Power to Shields",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [TheSkeldTask.ElectricalDivertPowerToShields]: {
                    id: 21,
                    name: "Electrical: Divert Power to Shields",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.ElectricalDivertPowerToWeapons]: {
                    id: 22,
                    name: "Electrical: Divert Power to Weapons",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.ElectricalDivertPowerToCommunications]: {
                    id: 23,
                    name: "Electrical: Divert Power to Communications",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.ElectricalDivertPowerToUpperEngine]: {
                    id: 24,
                    name: "Electrical: Divert Power to Upper Engine",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.ElectricalDivertPowerToO2]: {
                    id: 25,
                    name: "Electrical: Divert Power to O2",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.ElectricalDivertPowerToNavigation]: {
                    id: 26,
                    name: "Electrical: Divert Power to Navigation",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.ElectricalDivertPowerToLowerEngine]: {
                    id: 27,
                    name: "Electrical: Divert Power to Lower Engine",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [TheSkeldTask.ElectricalDivertPowerToSecurity]: {
                    id: 28,
                    name: "Electrical: Divert Power to Security",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
    },
    [MapID.MiraHQ]: {
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [MiraHQTask.HallwayFixWiring]: {
                    id: 0,
                    name: "Hallway: Fix Wiring",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.EnterIdCode]: {
            name: "Enter ID Code",
            type: TaskType.EnterIdCode,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [MiraHQTask.AdminEnterIDCode]: {
                    id: 1,
                    name: "Admin: Enter ID Code",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Long,
            visual: true,
            consoles: {
                [MiraHQTask.MedBaySubmitScan]: {
                    id: 2,
                    name: "Medbay: Submit Scan",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [MiraHQTask.BalconyClearAsteroids]: {
                    id: 3,
                    name: "Balcony: Clear Asteroids",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.DivertPower]: {
            name: "Divert Power to Admin",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.ElectricalDivertPowerToAdmin]: {
                    id: 4,
                    name: "Electrical: Divert Power to Admin",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [MiraHQTask.ElectricalDivertPowerToCafeteria]: {
                    id: 5,
                    name: "Electrical: Divert Power to Cafeteria",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [MiraHQTask.ElectricalDivertPowerToCommunications]: {
                    id: 6,
                    name: "Electrical: Divert Power to Communications",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [MiraHQTask.ElectricalDivertPowerToLaunchpad]: {
                    id: 7,
                    name: "Electrical: Divert Power to Launchpad",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [MiraHQTask.ElectricalDivertPowerToMedBay]: {
                    id: 8,
                    name: "Electrical: Divert Power to Medbay",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [MiraHQTask.ElectricalDivertPowerToOffice]: {
                    id: 9,
                    name: "Electrical: Divert Power to Office",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [MiraHQTask.ElectricalDivertPowerToGreenhouse]: {
                    id: 12,
                    name: "Electrical: Divert Power to Greenhouse",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [MiraHQTask.ElectricalDivertPowerToLaboratory]: {
                    id: 21,
                    name: "Electrical: Divert Power to Laboratory",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.WaterPlants]: {
            name: "Water Plants",
            type: TaskType.WaterPlants,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [MiraHQTask.StorageWaterPlants]: {
                    id: 10,
                    name: "Storage: Water Plants",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [MiraHQTask.ReactorStartReactor]: {
                    id: 11,
                    name: "Reactor: Start Reactor",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ChartCourse]: {
            name: "Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.AdminChartCourse]: {
                    id: 13,
                    name: "Admin: Chart Course",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.CleanO2Filter]: {
            name: "Clean O2 Filter",
            type: TaskType.CleanO2Filter,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.GreenhouseCleanO2Filter]: {
                    id: 14,
                    name: "Greenhouse: Clean O2 Filter",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.FuelEngines]: {
            name: "Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.LaunchpadFuelEngines]: {
                    id: 15,
                    name: "Launchpad: Fuel Engines",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.AssembleArtifact]: {
            name: "Assemble Artifact",
            type: TaskType.AssembleArtifact,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.LaboratoryAssembleArtifact]: {
                    id: 16,
                    name: "Laboratory: Assemble Artifact",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.SortSamples]: {
            name: "Sort Samples",
            type: TaskType.SortSamples,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.LaboratorySortSamples]: {
                    id: 17,
                    name: "Laboratory: Sort Samples",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.PrimeShields]: {
            name: "Prime Shields",
            type: TaskType.PrimeShields,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.AdminPrimeShields]: {
                    id: 18,
                    name: "Admin: Prime Shields",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.EmptyGarbage]: {
            name: "Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.CafeteriaEmptyGarbage]: {
                    id: 19,
                    name: "Cafeteria: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.MeasureWeather]: {
            name: "Measure Weather",
            type: TaskType.MeasureWeather,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.BalconyMeasureWeather]: {
                    id: 20,
                    name: "Balcony: Measure Weather",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.BuyBeverage]: {
            name: "Buy Beverage",
            type: TaskType.BuyBeverage,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.CafeteriaBuyBeverage]: {
                    id: 22,
                    name: "Cafeteria: Buy Beverage",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ProcessData]: {
            name: "Process Data",
            type: TaskType.ProcessData,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.OfficeProcessData]: {
                    id: 23,
                    name: "Office: Process Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.RunDiagnostics]: {
            name: "Run Diagnostics",
            type: TaskType.RunDiagnostics,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [MiraHQTask.LaunchpadRunDiagnostics]: {
                    id: 24,
                    name: "Launchpad: Run Diagnostics",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [MiraHQTask.ReactorUnlockManifolds]: {
                    id: 25,
                    name: "Reactor: Unlock Manifolds",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
    },
    [MapID.Polus]: {
        [TaskType.SwipeCard]: {
            name: "Swipe Card",
            type: TaskType.SwipeCard,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [PolusTask.OfficeSwipeCard]: {
                    id: 0,
                    name: "Office: Swipe Card",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.InsertKeys]: {
            name: "Insert Keys",
            type: TaskType.InsertKeys,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [PolusTask.DropshipInsertKeys]: {
                    id: 1,
                    name: "Dropship: Insert Keys",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ScanBoardingPass]: {
            name: "Scan Boarding Pass",
            type: TaskType.ScanBoardingPass,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [PolusTask.OfficeScanBoardingPass]: {
                    id: 2,
                    name: "Office: Scan Boarding Pass",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [PolusTask.ElectricalFixWiring]: {
                    id: 3,
                    name: "Electrical: Fix Wiring",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.UploadData]: {
            name: "Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.WeaponsDownloadData]: {
                    id: 4,
                    name: "Weapons: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.OfficeDownloadData]: {
                    id: 5,
                    name: "Office: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.ElectricalDownloadData]: {
                    id: 6,
                    name: "Electrical: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.SpecimenRoomDownloadData]: {
                    id: 7,
                    name: "Specimen Room: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.O2DownloadData]: {
                    id: 8,
                    name: "O2: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [PolusTask.SpecimenRoomStartReactor]: {
                    id: 9,
                    name: "Specimen Room: Start Reactor",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.FuelEngines]: {
            name: "Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [PolusTask.StorageFuelEngines]: {
                    id: 10,
                    name: "Storage: Fuel Engines",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.OpenWaterways]: {
            name: "Open Waterways",
            type: TaskType.OpenWaterways,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [PolusTask.BoilerRoomOpenWaterways]: {
                    id: 11,
                    name: "Boiler Room: Open Waterways",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.InspectSample]: {
            name: "Inspect Sample",
            type: TaskType.InspectSample,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [PolusTask.MedBayInspectSample]: {
                    id: 12,
                    name: "Medbay: Inspect Sample",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ReplaceWaterJug]: {
            name: "Replace Water Jug",
            type: TaskType.ReplaceWaterJug,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [PolusTask.BoilerRoomReplaceWaterJug]: {
                    id: 13,
                    name: "Boiler Room: Replace Water Jug",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ActivateWeatherNodes]: {
            name: "Fix Weather Node Node_GI",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [PolusTask.OutsideFixWeatherNodeNODE_GI]: {
                    id: 14,
                    name: "Outside: Fix Weather Node Node_GI",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.OutsideFixWeatherNodeNODE_IRO]: {
                    id: 15,
                    name: "Outside: Fix Weather Node Node_IRO",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.OutsideFixWeatherNodeNODE_PD]: {
                    id: 16,
                    name: "Outside: Fix Weather Node Node_PD",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.OutsideFixWeatherNodeNODE_TB]: {
                    id: 17,
                    name: "Outside: Fix Weather Node Node_TB",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.OutsideFixWeatherNodeNODE_CA]: {
                    id: 27,
                    name: "Outside: Fix Weather Node Node_CA",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.OutsideFixWeatherNodeNODE_MLG]: {
                    id: 28,
                    name: "Outside: Fix Weather Node Node_MLG",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.RebootWifi]: {
            name: "Reboot WiFi",
            type: TaskType.RebootWifi,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [PolusTask.CommunicationsRebootWiFi]: {
                    id: 18,
                    name: "Communications: Reboot WiFi",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.MonitorO2]: {
            name: "Monitor Tree",
            type: TaskType.MonitorO2,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.O2MonitorTree]: {
                    id: 19,
                    name: "O2: Monitor Tree",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.SpecimenRoomUnlockManifolds]: {
                    id: 20,
                    name: "Specimen Room: Unlock Manifolds",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.StoreArtifacts]: {
            name: "Store Artifacts",
            type: TaskType.StoreArtifacts,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.SpecimenRoomStoreArtifacts]: {
                    id: 21,
                    name: "Specimen Room: Store Artifacts",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.FillCanisters]: {
            name: "Fill Canisters",
            type: TaskType.FillCanisters,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.O2FillCanisters]: {
                    id: 22,
                    name: "O2: Fill Canisters",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.EmptyGarbage]: {
            name: "Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.O2EmptyGarbage]: {
                    id: 23,
                    name: "O2: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ChartCourse]: {
            name: "Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.DropshipChartCourse]: {
                    id: 24,
                    name: "Dropship: Chart Course",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Short,
            visual: true,
            consoles: {
                [PolusTask.MedBaySubmitScan]: {
                    id: 25,
                    name: "Medbay: Submit Scan",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Short,
            visual: true,
            consoles: {
                [PolusTask.WeaponsClearAsteroids]: {
                    id: 26,
                    name: "Weapons: Clear Asteroids",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.AlignTelescope]: {
            name: "Align Telescope",
            type: TaskType.AlignTelescope,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.LaboratoryAlignTelescope]: {
                    id: 29,
                    name: "Laboratory: Align Telescope",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.RepairDrill]: {
            name: "Repair Drill",
            type: TaskType.RepairDrill,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.LaboratoryRepairDrill]: {
                    id: 30,
                    name: "Laboratory: Repair Drill",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.RecordTemperature]: {
            name: "Record Temperature",
            type: TaskType.RecordTemperature,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [PolusTask.LaboratoryRecordTemperature]: {
                    id: 31,
                    name: "Laboratory: Record Temperature",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [PolusTask.OutsideRecordTemperature]: {
                    id: 32,
                    name: "Outside: Record Temperature",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
    },
    [MapID.AprilFoolsTheSkeld]: {},
    [MapID.Airship]: {
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [AirshipTask.ElectricalFixWiring]: {
                    id: 0,
                    name: "Electrical: Fix Wiring",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.EnterIdCode]: {
            name: "Enter ID Code",
            type: TaskType.EnterIdCode,
            length: TaskLength.Common,
            visual: false,
            consoles: {
                [AirshipTask.MeetingRoomEnterIdCode]: {
                    id: 1,
                    name: "Meeting Room: Enter ID Code",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.ResetBreakers]: {
            name: "Reset Breakers",
            type: TaskType.ResetBreakers,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.ElectricalResetBreakers]: {
                    id: 2,
                    name: "Electrical: Reset Breakers",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.UploadData]: {
            name: "Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.VaultRoomDownloadData]: {
                    id: 3,
                    name: "Vault Room: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.BrigDownloadData]: {
                    id: 4,
                    name: "Brig: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.CargoBayDownloadData]: {
                    id: 5,
                    name: "Cargo Bay: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.GapRoomDownloadData]: {
                    id: 6,
                    name: "Gap Room: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.RecordsDownloadData]: {
                    id: 7,
                    name: "Records: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.ArmoryDownloadData]: {
                    id: 19,
                    name: "Armory: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.CockpitDownloadData]: {
                    id: 20,
                    name: "Cockpit: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.CommunicationsDownloadData]: {
                    id: 21,
                    name: "Comms: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.MedicalDownloadData]: {
                    id: 22,
                    name: "Medical: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.ViewingDeckDownloadData]: {
                    id: 23,
                    name: "Viewing Deck: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.UnlockSafe]: {
            name: "Unlock Safe",
            type: TaskType.UnlockSafe,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.CargoBayUnlockSafe]: {
                    id: 8,
                    name: "Cargo Bay: Unlock Safe",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.StartFans]: {
            name: "Start Fans",
            type: TaskType.StartFans,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.VentilationStartFans]: {
                    id: 9,
                    name: "Ventilation: Start Fans",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.EmptyGarbage]: {
            name: "Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.MainHallEmptyGarbage]: {
                    id: 10,
                    name: "Main Hall: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.MedicalEmptyGarbage]: {
                    id: 11,
                    name: "Medical: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.KitchenEmptyGarbage]: {
                    id: 12,
                    name: "Kitchen: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.DevelopPhotos]: {
            name: "Develop Photos",
            type: TaskType.DevelopPhotos,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.MainHallDevelopPhotos]: {
                    id: 13,
                    name: "Main Hall: Develop Photos",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.FuelEngines]: {
            name: "Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.CargoBayFuelEngines]: {
                    id: 14,
                    name: "Cargo Bay: Fuel Engines",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.RewindTapes]: {
            name: "Rewind Tapes",
            type: TaskType.RewindTapes,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.SecurityRewindTapes]: {
                    id: 15,
                    name: "Security: Rewind Tapes",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.PolishRuby]: {
            name: "Polish Ruby",
            type: TaskType.PolishRuby,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.VaultRoomPolishRuby]: {
                    id: 16,
                    name: "Vault Room: Polish Ruby",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.CalibrateDistributor]: {
            name: "Calibrate Distributor",
            type: TaskType.CalibrateDistributor,
            length: TaskLength.Long,
            visual: false,
            consoles: {
                [AirshipTask.ElectricalCalibrateDistributor]: {
                    id: 17,
                    name: "Electrical: Calibrate Distributor",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.StabilizeSteering]: {
            name: "Stabilize Steering",
            type: TaskType.StabilizeSteering,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.CockpitStabilizeSteering]: {
                    id: 18,
                    name: "Cockpit: Stabilize Steering",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.DivertPower]: {
            name: "Divert Power to Armory",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.ElectricalDivertPowerToArmory]: {
                    id: 24,
                    name: "Electrical: Divert Power to Armory",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.ElectricalDivertPowerToCockpit]: {
                    id: 25,
                    name: "Electrical: Divert Power to Cockpit",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.ElectricalDivertPowerToGapRoom]: {
                    id: 26,
                    name: "Electrical: Divert Power to Gap Room",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.ElectricalDivertPowerToMainHall]: {
                    id: 27,
                    name: "Electrical: Divert Power to Main Hall",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.ElectricalDivertPowerToMeetingRoom]: {
                    id: 28,
                    name: "Electrical: Divert Power to Meeting Room",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.ElectricalDivertPowerToShowers]: {
                    id: 29,
                    name: "Electrical: Divert Power to Showers",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
                [AirshipTask.ElectricalDivertPowerToEngine]: {
                    id: 30,
                    name: "Electrical: Divert Power to Engine",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.PickUpTowels]: {
            name: "Pick Up Towels",
            type: TaskType.PickUpTowels,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.ShowersPickUpTowels]: {
                    id: 31,
                    name: "Showers: Pick Up Towels",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.CleanToilet]: {
            name: "Clean Toilet",
            type: TaskType.CleanToilet,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.LoungeCleanToilet]: {
                    id: 32,
                    name: "Lounge: Clean Toilet",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.DressMannequin]: {
            name: "Dress Mannequin",
            type: TaskType.DressMannequin,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.VaultRoomDressMannequin]: {
                    id: 33,
                    name: "Vault Room: Dress Mannequin",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.SortRecords]: {
            name: "Sort Records",
            type: TaskType.SortRecords,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.RecordsSortRecords]: {
                    id: 34,
                    name: "Records: Sort Records",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.PutAwayPistols]: {
            name: "Put Away Pistols",
            type: TaskType.PutAwayPistols,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.ArmoryPutAwayPistols]: {
                    id: 35,
                    name: "Armory: Put Away Pistols",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.PutAwayRifles]: {
            name: "Put Away Rifles",
            type: TaskType.PutAwayRifles,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.ArmoryPutAwayRifles]: {
                    id: 36,
                    name: "Armory: Put Away Rifles",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.Decontaminate]: {
            name: "Decontaminate",
            type: TaskType.Decontaminate,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.MainHallDecontaminate]: {
                    id: 37,
                    name: "Main Hall: Decontaminate",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.MakeBurger]: {
            name: "Make Burger",
            type: TaskType.MakeBurger,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.KitchenMakeBurger]: {
                    id: 38,
                    name: "Kitchen: Make Burger",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
        [TaskType.FixShower]: {
            name: "Fix Shower",
            type: TaskType.FixShower,
            length: TaskLength.Short,
            visual: false,
            consoles: {
                [AirshipTask.ShowersFixShower]: {
                    id: 39,
                    name: "Showers: Fix Shower",
                    position: {
                        x: 0,
                        y: 0,
                    },
                },
            },
        },
    }
};
