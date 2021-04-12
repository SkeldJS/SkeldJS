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
            consoles: [
                {
                    id: TheSkeldTask.AdminSwipeCard,
                    name: "Admin: Swipe Card",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.ElectricalFixWiring,
                    name: "Electrical: Fix Wiring",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Long,
            visual: true,
            consoles: [
                {
                    id: TheSkeldTask.WeaponsClearAsteroids,
                    name: "Weapons: Clear Asteroids",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.AlignEngineOutput]: {
            name: "Align Engine Output",
            type: TaskType.AlignEngineOutput,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.EnginesAlignEngineOutput,
                    name: "Engines: Align Engine Output",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Long,
            visual: true,
            consoles: [
                {
                    id: TheSkeldTask.MedBaySubmitScan,
                    name: "Medbay: Submit Scan",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.InspectSample]: {
            name: "Inspect Sample",
            type: TaskType.InspectSample,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.MedBayInspectSample,
                    name: "Medbay: Inspect Sample",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.FuelEngines]: {
            name: "Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.StorageFuelEngines,
                    name: "Storage: Fuel Engines",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.ReactorStartReactor,
                    name: "Reactor: Start Reactor",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.EmptyChute]: {
            name: "Empty Chute",
            type: TaskType.EmptyChute,
            length: TaskLength.Long,
            visual: true,
            consoles: [
                {
                    id: TheSkeldTask.O2EmptyChute,
                    name: "O2: Empty Chute",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.EmptyGarbage]: {
            name: "Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Long,
            visual: true,
            consoles: [
                {
                    id: TheSkeldTask.CafeteriaEmptyGarbage,
                    name: "Cafeteria: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.UploadData]: {
            name: "Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.CommunicationsDownloadData,
                    name: "Communications: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.ElectricalDownloadData,
                    name: "Electrical: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.WeaponsDownloadData,
                    name: "Weapons: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.CafeteriaDownloadData,
                    name: "Cafeteria: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.NavigationDownloadData,
                    name: "Navigation: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.CalibrateDistributor]: {
            name: "Calibrate Distributor",
            type: TaskType.CalibrateDistributor,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.ElectricalCalibrateDistributor,
                    name: "Electrical: Calibrate Distributor",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ChartCourse]: {
            name: "Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.NavigationChartCourse,
                    name: "Navigation: Chart Course",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.CleanO2Filter]: {
            name: "Clean O2 Filter",
            type: TaskType.CleanO2Filter,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.O2CleanO2Filter,
                    name: "O2: Clean O2 Filter",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.ReactorUnlockManifolds,
                    name: "Reactor: Unlock Manifolds",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.StabilizeSteering]: {
            name: "Stabilize Steering",
            type: TaskType.StabilizeSteering,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.NavigationStabilizeSteering,
                    name: "Navigation: Stabilize Steering",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.PrimeShields]: {
            name: "Prime Shields",
            type: TaskType.PrimeShields,
            length: TaskLength.Short,
            visual: true,
            consoles: [
                {
                    id: TheSkeldTask.ShieldsPrimeShields,
                    name: "Shields: Prime Shields",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.DivertPower]: {
            name: "Divert Power to Shields",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: TheSkeldTask.ElectricalDivertPowerToShields,
                    name: "Electrical: Divert Power to Shields",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.ElectricalDivertPowerToWeapons,
                    name: "Electrical: Divert Power to Weapons",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.ElectricalDivertPowerToCommunications,
                    name: "Electrical: Divert Power to Communications",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.ElectricalDivertPowerToUpperEngine,
                    name: "Electrical: Divert Power to Upper Engine",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.ElectricalDivertPowerToO2,
                    name: "Electrical: Divert Power to O2",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.ElectricalDivertPowerToNavigation,
                    name: "Electrical: Divert Power to Navigation",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.ElectricalDivertPowerToLowerEngine,
                    name: "Electrical: Divert Power to Lower Engine",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: TheSkeldTask.ElectricalDivertPowerToSecurity,
                    name: "Electrical: Divert Power to Security",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        }
    },
    [MapID.MiraHQ]: {
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.HallwayFixWiring,
                    name: "Hallway: Fix Wiring",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.EnterIdCode]: {
            name: "Enter ID Code",
            type: TaskType.EnterIdCode,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.AdminEnterIDCode,
                    name: "Admin: Enter ID Code",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Long,
            visual: true,
            consoles: [
                {
                    id: MiraHQTask.MedBaySubmitScan,
                    name: "Medbay: Submit Scan",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.BalconyClearAsteroids,
                    name: "Balcony: Clear Asteroids",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.DivertPower]: {
            name: "Divert Power to Admin",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.ElectricalDivertPowerToAdmin,
                    name: "Electrical: Divert Power to Admin",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: MiraHQTask.ElectricalDivertPowerToCafeteria,
                    name: "Electrical: Divert Power to Cafeteria",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: MiraHQTask.ElectricalDivertPowerToCommunications,
                    name: "Electrical: Divert Power to Communications",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: MiraHQTask.ElectricalDivertPowerToLaunchpad,
                    name: "Electrical: Divert Power to Launchpad",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: MiraHQTask.ElectricalDivertPowerToMedBay,
                    name: "Electrical: Divert Power to Medbay",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: MiraHQTask.ElectricalDivertPowerToOffice,
                    name: "Electrical: Divert Power to Office",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: MiraHQTask.ElectricalDivertPowerToGreenhouse,
                    name: "Electrical: Divert Power to Greenhouse",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: MiraHQTask.ElectricalDivertPowerToLaboratory,
                    name: "Electrical: Divert Power to Laboratory",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.WaterPlants]: {
            name: "Water Plants",
            type: TaskType.WaterPlants,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.StorageWaterPlants,
                    name: "Storage: Water Plants",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.ReactorStartReactor,
                    name: "Reactor: Start Reactor",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ChartCourse]: {
            name: "Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.AdminChartCourse,
                    name: "Admin: Chart Course",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.CleanO2Filter]: {
            name: "Clean O2 Filter",
            type: TaskType.CleanO2Filter,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.GreenhouseCleanO2Filter,
                    name: "Greenhouse: Clean O2 Filter",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.FuelEngines]: {
            name: "Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.LaunchpadFuelEngines,
                    name: "Launchpad: Fuel Engines",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.AssembleArtifact]: {
            name: "Assemble Artifact",
            type: TaskType.AssembleArtifact,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.LaboratoryAssembleArtifact,
                    name: "Laboratory: Assemble Artifact",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.SortSamples]: {
            name: "Sort Samples",
            type: TaskType.SortSamples,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.LaboratorySortSamples,
                    name: "Laboratory: Sort Samples",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.PrimeShields]: {
            name: "Prime Shields",
            type: TaskType.PrimeShields,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.AdminPrimeShields,
                    name: "Admin: Prime Shields",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.EmptyGarbage]: {
            name: "Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.CafeteriaEmptyGarbage,
                    name: "Cafeteria: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.MeasureWeather]: {
            name: "Measure Weather",
            type: TaskType.MeasureWeather,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.BalconyMeasureWeather,
                    name: "Balcony: Measure Weather",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.BuyBeverage]: {
            name: "Buy Beverage",
            type: TaskType.BuyBeverage,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.CafeteriaBuyBeverage,
                    name: "Cafeteria: Buy Beverage",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ProcessData]: {
            name: "Process Data",
            type: TaskType.ProcessData,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.OfficeProcessData,
                    name: "Office: Process Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.RunDiagnostics]: {
            name: "Run Diagnostics",
            type: TaskType.RunDiagnostics,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.LaunchpadRunDiagnostics,
                    name: "Launchpad: Run Diagnostics",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: MiraHQTask.ReactorUnlockManifolds,
                    name: "Reactor: Unlock Manifolds",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        }
    },
    [MapID.Polus]: {
        [TaskType.SwipeCard]: {
            name: "Swipe Card",
            type: TaskType.SwipeCard,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: PolusTask.OfficeSwipeCard,
                    name: "Office: Swipe Card",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.InsertKeys]: {
            name: "Insert Keys",
            type: TaskType.InsertKeys,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: PolusTask.DropshipInsertKeys,
                    name: "Dropship: Insert Keys",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ScanBoardingPass]: {
            name: "Scan Boarding Pass",
            type: TaskType.ScanBoardingPass,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: PolusTask.OfficeScanBoardingPass,
                    name: "Office: Scan Boarding Pass",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: PolusTask.ElectricalFixWiring,
                    name: "Electrical: Fix Wiring",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.UploadData]: {
            name: "Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.WeaponsDownloadData,
                    name: "Weapons: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.OfficeDownloadData,
                    name: "Office: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.ElectricalDownloadData,
                    name: "Electrical: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.SpecimenRoomDownloadData,
                    name: "Specimen Room: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.O2DownloadData,
                    name: "O2: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: PolusTask.SpecimenRoomStartReactor,
                    name: "Specimen Room: Start Reactor",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.FuelEngines]: {
            name: "Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: PolusTask.StorageFuelEngines,
                    name: "Storage: Fuel Engines",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.OpenWaterways]: {
            name: "Open Waterways",
            type: TaskType.OpenWaterways,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: PolusTask.BoilerRoomOpenWaterways,
                    name: "Boiler Room: Open Waterways",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.InspectSample]: {
            name: "Inspect Sample",
            type: TaskType.InspectSample,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: PolusTask.MedBayInspectSample,
                    name: "Medbay: Inspect Sample",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ReplaceWaterJug]: {
            name: "Replace Water Jug",
            type: TaskType.ReplaceWaterJug,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: PolusTask.BoilerRoomReplaceWaterJug,
                    name: "Boiler Room: Replace Water Jug",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ActivateWeatherNodes]: {
            name: "Fix Weather Node Node_GI",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: PolusTask.OutsideFixWeatherNodeNODE_GI,
                    name: "Outside: Fix Weather Node Node_GI",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.OutsideFixWeatherNodeNODE_IRO,
                    name: "Outside: Fix Weather Node Node_IRO",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.OutsideFixWeatherNodeNODE_PD,
                    name: "Outside: Fix Weather Node Node_PD",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.OutsideFixWeatherNodeNODE_TB,
                    name: "Outside: Fix Weather Node Node_TB",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.OutsideFixWeatherNodeNODE_CA,
                    name: "Outside: Fix Weather Node Node_CA",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.OutsideFixWeatherNodeNODE_MLG,
                    name: "Outside: Fix Weather Node Node_MLG",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.RebootWifi]: {
            name: "Reboot WiFi",
            type: TaskType.RebootWifi,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: PolusTask.CommunicationsRebootWiFi,
                    name: "Communications: Reboot WiFi",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.MonitorO2]: {
            name: "Monitor Tree",
            type: TaskType.MonitorO2,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.O2MonitorTree,
                    name: "O2: Monitor Tree",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.SpecimenRoomUnlockManifolds,
                    name: "Specimen Room: Unlock Manifolds",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.StoreArtifacts]: {
            name: "Store Artifacts",
            type: TaskType.StoreArtifacts,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.SpecimenRoomStoreArtifacts,
                    name: "Specimen Room: Store Artifacts",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.FillCanisters]: {
            name: "Fill Canisters",
            type: TaskType.FillCanisters,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.O2FillCanisters,
                    name: "O2: Fill Canisters",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.EmptyGarbage]: {
            name: "Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.O2EmptyGarbage,
                    name: "O2: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ChartCourse]: {
            name: "Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.DropshipChartCourse,
                    name: "Dropship: Chart Course",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Short,
            visual: true,
            consoles: [
                {
                    id: PolusTask.MedBaySubmitScan,
                    name: "Medbay: Submit Scan",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Short,
            visual: true,
            consoles: [
                {
                    id: PolusTask.WeaponsClearAsteroids,
                    name: "Weapons: Clear Asteroids",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.AlignTelescope]: {
            name: "Align Telescope",
            type: TaskType.AlignTelescope,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.LaboratoryAlignTelescope,
                    name: "Laboratory: Align Telescope",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.RepairDrill]: {
            name: "Repair Drill",
            type: TaskType.RepairDrill,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.LaboratoryRepairDrill,
                    name: "Laboratory: Repair Drill",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.RecordTemperature]: {
            name: "Record Temperature",
            type: TaskType.RecordTemperature,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: PolusTask.LaboratoryRecordTemperature,
                    name: "Laboratory: Record Temperature",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: PolusTask.OutsideRecordTemperature,
                    name: "Outside: Record Temperature",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        }
    },
    [MapID.AprilFoolsTheSkeld]: {},
    [MapID.Airship]: {
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.ElectricalFixWiring,
                    name: "Electrical: Fix Wiring",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.EnterIdCode]: {
            name: "Enter ID Code",
            type: TaskType.EnterIdCode,
            length: TaskLength.Common,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.MeetingRoomEnterIdCode,
                    name: "Meeting Room: Enter ID Code",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.ResetBreakers]: {
            name: "Reset Breakers",
            type: TaskType.ResetBreakers,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.ElectricalResetBreakers,
                    name: "Electrical: Reset Breakers",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.UploadData]: {
            name: "Download Data",
            type: TaskType.UploadData,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.VaultRoomDownloadData,
                    name: "Vault Room: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.BrigDownloadData,
                    name: "Brig: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.CargoBayDownloadData,
                    name: "Cargo Bay: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.GapRoomDownloadData,
                    name: "Gap Room: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.RecordsDownloadData,
                    name: "Records: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.ArmoryDownloadData,
                    name: "Armory: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.CockpitDownloadData,
                    name: "Cockpit: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.CommunicationsDownloadData,
                    name: "Comms: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.MedicalDownloadData,
                    name: "Medical: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.ViewingDeckDownloadData,
                    name: "Viewing Deck: Download Data",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.UnlockSafe]: {
            name: "Unlock Safe",
            type: TaskType.UnlockSafe,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.CargoBayUnlockSafe,
                    name: "Cargo Bay: Unlock Safe",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.StartFans]: {
            name: "Start Fans",
            type: TaskType.StartFans,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.VentilationStartFans,
                    name: "Ventilation: Start Fans",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.EmptyGarbage]: {
            name: "Empty Garbage",
            type: TaskType.EmptyGarbage,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.MainHallEmptyGarbage,
                    name: "Main Hall: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.MedicalEmptyGarbage,
                    name: "Medical: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.KitchenEmptyGarbage,
                    name: "Kitchen: Empty Garbage",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.DevelopPhotos]: {
            name: "Develop Photos",
            type: TaskType.DevelopPhotos,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.MainHallDevelopPhotos,
                    name: "Main Hall: Develop Photos",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.FuelEngines]: {
            name: "Fuel Engines",
            type: TaskType.FuelEngines,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.CargoBayFuelEngines,
                    name: "Cargo Bay: Fuel Engines",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.RewindTapes]: {
            name: "Rewind Tapes",
            type: TaskType.RewindTapes,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.SecurityRewindTapes,
                    name: "Security: Rewind Tapes",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.PolishRuby]: {
            name: "Polish Ruby",
            type: TaskType.PolishRuby,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.VaultRoomPolishRuby,
                    name: "Vault Room: Polish Ruby",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.CalibrateDistributor]: {
            name: "Calibrate Distributor",
            type: TaskType.CalibrateDistributor,
            length: TaskLength.Long,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.ElectricalCalibrateDistributor,
                    name: "Electrical: Calibrate Distributor",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.StabilizeSteering]: {
            name: "Stabilize Steering",
            type: TaskType.StabilizeSteering,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.CockpitStabilizeSteering,
                    name: "Cockpit: Stabilize Steering",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.DivertPower]: {
            name: "Divert Power to Armory",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.ElectricalDivertPowerToArmory,
                    name: "Electrical: Divert Power to Armory",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.ElectricalDivertPowerToCockpit,
                    name: "Electrical: Divert Power to Cockpit",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.ElectricalDivertPowerToGapRoom,
                    name: "Electrical: Divert Power to Gap Room",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.ElectricalDivertPowerToMainHall,
                    name: "Electrical: Divert Power to Main Hall",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.ElectricalDivertPowerToMeetingRoom,
                    name: "Electrical: Divert Power to Meeting Room",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.ElectricalDivertPowerToShowers,
                    name: "Electrical: Divert Power to Showers",
                    position: {
                        x: 0,
                        y: 0,
                    }
                },
                {
                    id: AirshipTask.ElectricalDivertPowerToEngine,
                    name: "Electrical: Divert Power to Engine",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.PickUpTowels]: {
            name: "Pick Up Towels",
            type: TaskType.PickUpTowels,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.ShowersPickUpTowels,
                    name: "Showers: Pick Up Towels",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.CleanToilet]: {
            name: "Clean Toilet",
            type: TaskType.CleanToilet,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.LoungeCleanToilet,
                    name: "Lounge: Clean Toilet",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.DressMannequin]: {
            name: "Dress Mannequin",
            type: TaskType.DressMannequin,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.VaultRoomDressMannequin,
                    name: "Vault Room: Dress Mannequin",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.SortRecords]: {
            name: "Sort Records",
            type: TaskType.SortRecords,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.RecordsSortRecords,
                    name: "Records: Sort Records",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.PutAwayPistols]: {
            name: "Put Away Pistols",
            type: TaskType.PutAwayPistols,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.ArmoryPutAwayPistols,
                    name: "Armory: Put Away Pistols",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.PutAwayRifles]: {
            name: "Put Away Rifles",
            type: TaskType.PutAwayRifles,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.ArmoryPutAwayRifles,
                    name: "Armory: Put Away Rifles",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.Decontaminate]: {
            name: "Decontaminate",
            type: TaskType.Decontaminate,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.MainHallDecontaminate,
                    name: "Main Hall: Decontaminate",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.MakeBurger]: {
            name: "Make Burger",
            type: TaskType.MakeBurger,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.KitchenMakeBurger,
                    name: "Kitchen: Make Burger",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        },
        [TaskType.FixShower]: {
            name: "Fix Shower",
            type: TaskType.FixShower,
            length: TaskLength.Short,
            visual: false,
            consoles: [
                {
                    id: AirshipTask.ShowersFixShower,
                    name: "Showers: Fix Shower",
                    position: {
                        x: 0,
                        y: 0,
                    }
                }
            ]
        }
    }
};
