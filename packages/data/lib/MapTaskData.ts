import {
    TaskLength,
    TaskType,
    GameMap
} from "@skeldjs/constant";

interface ConsoleDataModel {
    name: string;
    usableDistance: number;
    position: {
        x: number;
        y: number;
    };
}

interface TaskDataModel {
    name: string;
    type: TaskType;
    length: TaskLength;
    consoles: Record<number, ConsoleDataModel>;
}

export const MapTaskData: Record<GameMap, Record<number, TaskDataModel>> = {
    [GameMap.TheSkeld]: {
        [TaskType.UploadData]: {
            name: "Upload Data",
            type: TaskType.UploadData,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Admin: Upload Data",
                    usableDistance: 1,
                    position: {
                        x: 2.50799966,
                        y: -6.26520061,
                    }
                }
            ]
        },
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Admin: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 1.392,
                        y: -6.4092,
                    }
                },
                {
                    name: "Cafeteria: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: -5.28119946,
                        y: 5.2464,
                    }
                },
                {
                    name: "Navigation: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 14.5199995,
                        y: -3.77400017,
                    }
                },
                {
                    name: "Electrical: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: -7.72799969,
                        y: -7.6668,
                    }
                },
                {
                    name: "Storage: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: -1.932,
                        y: -8.7204,
                    }
                },
                {
                    name: "Security: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: -15.5592,
                        y: -4.5923996,
                    }
                }
            ]
        },
        [TaskType.SwipeCard]: {
            name: "Swipe Card",
            type: TaskType.SwipeCard,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Admin: Swipe Card",
                    usableDistance: 1,
                    position: {
                        x: 5.6352005,
                        y: -8.632801,
                    }
                }
            ]
        },
        [TaskType.StabilizeSteering]: {
            name: "Stabilize Steering",
            type: TaskType.StabilizeSteering,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Navigation: Stabilize Steering",
                    usableDistance: 1.25,
                    position: {
                        x: 18.732,
                        y: -4.728,
                    }
                }
            ]
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Weapons: Clear Asteroids",
                    usableDistance: 1.2,
                    position: {
                        x: 9.087601,
                        y: 1.812,
                    }
                }
            ]
        },
        [TaskType.CleanO2Filter]: {
            name: "Clean O2 Filter",
            type: TaskType.CleanO2Filter,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "O2: Clean O2 Filter",
                    usableDistance: 0.8,
                    position: {
                        x: 5.7432,
                        y: -2.9772,
                    }
                }
            ]
        },
        [TaskType.PrimeShields]: {
            name: "Prime Shields",
            type: TaskType.PrimeShields,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Shields: Prime Shields",
                    usableDistance: 1,
                    position: {
                        x: 7.526399,
                        y: -13.9811993,
                    }
                }
            ]
        },
        [TaskType.CalibrateDistributor]: {
            name: "Calibrate Distributor",
            type: TaskType.CalibrateDistributor,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Electrical: Calibrate Distributor",
                    usableDistance: 1,
                    position: {
                        x: -5.86440039,
                        y: -7.4772,
                    }
                }
            ]
        },
        [TaskType.DivertPower]: {
            name: "Exit",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Electrical: Exit",
                    usableDistance: 1,
                    position: {
                        x: -9,
                        y: -7.29360056,
                    }
                }
            ]
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Reactor: Unlock Manifolds",
                    usableDistance: 1,
                    position: {
                        x: -22.5360012,
                        y: -2.4996,
                    }
                }
            ]
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Reactor: Start Reactor",
                    usableDistance: 1,
                    position: {
                        x: -21.792,
                        y: -5.5728,
                    }
                }
            ]
        },
        [TaskType.AlignEngineOutput]: {
            name: "Align Engine Output",
            type: TaskType.AlignEngineOutput,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Lower Engine: Align Engine Output",
                    usableDistance: 1,
                    position: {
                        x: -19.1507988,
                        y: -12.618,
                    }
                },
                {
                    name: "Upper Engine: Align Engine Output",
                    usableDistance: 1,
                    position: {
                        x: -19.176,
                        y: -0.414422125,
                    }
                }
            ]
        },
        [TaskType.InspectSample]: {
            name: "Inspect Sample",
            type: TaskType.InspectSample,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "MedBay: Inspect Sample",
                    usableDistance: 1,
                    position: {
                        x: -6.144,
                        y: -4.25999975,
                    }
                }
            ]
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "MedBay: Submit Scan",
                    usableDistance: 1,
                    position: {
                        x: -7.3284,
                        y: -5.24760056,
                    }
                }
            ]
        }
    },
    [GameMap.MiraHQ]: {
        [TaskType.RunDiagnostics]: {
            name: "Run Diagnostics",
            type: TaskType.RunDiagnostics,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Launchpad: Run Diagnostics",
                    usableDistance: 1.5,
                    position: {
                        x: -2.499,
                        y: 1.87300014,
                    }
                }
            ]
        },
        [TaskType.BuyBeverage]: {
            name: "Buy Beverage",
            type: TaskType.BuyBeverage,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Cafeteria: Buy Beverage",
                    usableDistance: 1,
                    position: {
                        x: 27.49,
                        y: 5.665,
                    }
                }
            ]
        },
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Storage: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 18.39,
                        y: 1.2,
                    }
                },
                {
                    name: "Hallway: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 12.096,
                        y: 8.04,
                    }
                },
                {
                    name: "Laboratory: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 6.125,
                        y: 14.958,
                    }
                },
                {
                    name: "Locker Room: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 4.35599947,
                        y: 2.53400016,
                    }
                },
                {
                    name: "Greenhouse: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 16.9800014,
                        y: 21.394,
                    }
                }
            ]
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Reactor: Start Reactor",
                    usableDistance: 1,
                    position: {
                        x: 2.549,
                        y: 12.4070005,
                    }
                }
            ]
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Reactor: Unlock Manifolds",
                    usableDistance: 1,
                    position: {
                        x: 0.442000151,
                        y: 13.2560005,
                    }
                }
            ]
        },
        [TaskType.DivertPower]: {
            name: "Exit",
            type: TaskType.DivertPower,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Reactor: Exit",
                    usableDistance: 1,
                    position: {
                        x: 0.77700007,
                        y: 11.484,
                    }
                }
            ]
        },
        [TaskType.SortSamples]: {
            name: "Sort Samples",
            type: TaskType.SortSamples,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Laboratory: Sort Samples",
                    usableDistance: 1,
                    position: {
                        x: 9.660001,
                        y: 11.1150007,
                    }
                }
            ]
        },
        [TaskType.AssembleArtifact]: {
            name: "Assemble Artifact",
            type: TaskType.AssembleArtifact,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Laboratory: Assemble Artifact",
                    usableDistance: 1,
                    position: {
                        x: 9.402,
                        y: 14.5680008,
                    }
                }
            ]
        },
        [TaskType.EnterIdCode]: {
            name: "Enter Id Code",
            type: TaskType.EnterIdCode,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Admin: Enter Id Code",
                    usableDistance: 1,
                    position: {
                        x: 19.894001,
                        y: 19.024,
                    }
                }
            ]
        },
        [TaskType.PrimeShields]: {
            name: "Prime Shields",
            type: TaskType.PrimeShields,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Admin: Prime Shields",
                    usableDistance: 1,
                    position: {
                        x: 21.169,
                        y: 17.945,
                    }
                }
            ]
        },
        [TaskType.ProcessData]: {
            name: "Process Data",
            type: TaskType.ProcessData,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Office: Process Data",
                    usableDistance: 1,
                    position: {
                        x: 15.776001,
                        y: 21.403,
                    }
                }
            ]
        },
        [TaskType.CleanO2Filter]: {
            name: "Clean O2 Filter",
            type: TaskType.CleanO2Filter,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Greenhouse: Clean O2 Filter",
                    usableDistance: 2,
                    position: {
                        x: 17.221,
                        y: 24.5050011,
                    }
                }
            ]
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Weapons: Clear Asteroids",
                    usableDistance: 1.8,
                    position: {
                        x: 19.213,
                        y: -2.414,
                    }
                }
            ]
        },
        [TaskType.MeasureWeather]: {
            name: "Measure Weather",
            type: TaskType.MeasureWeather,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Balcony: Measure Weather",
                    usableDistance: 1,
                    position: {
                        x: 28.9119987,
                        y: -1.701,
                    }
                }
            ]
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "MedBay: Submit Scan",
                    usableDistance: 1,
                    position: {
                        x: 16.233,
                        y: 0.262,
                    }
                }
            ]
        }
    },
    [GameMap.Polus]: {
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Electrical: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 3.06727982,
                        y: -8.691476,
                    }
                },
                {
                    name: "O2: Fix Wiring",
                    usableDistance: 0.77,
                    position: {
                        x: 6.499,
                        y: -18.458,
                    }
                },
                {
                    name: "Office: Fix Wiring",
                    usableDistance: 0.8,
                    position: {
                        x: 16.3737488,
                        y: -18.5055885,
                    }
                },
                {
                    name: "Decontamination: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 40.61,
                        y: -8.96,
                    }
                },
                {
                    name: "Laboratory: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 37.321003,
                        y: -8.944,
                    }
                },
                {
                    name: "Laboratory: Fix Wiring",
                    usableDistance: 1,
                    position: {
                        x: 32.9750023,
                        y: -9.031365,
                    }
                }
            ]
        },
        [TaskType.OpenWaterways]: {
            name: "Open Waterways",
            type: TaskType.OpenWaterways,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Boiler Room: Open Waterways",
                    usableDistance: 1,
                    position: {
                        x: 3.669,
                        y: -24.15,
                    }
                },
                {
                    name: "Boiler Room: Open Waterways",
                    usableDistance: 1,
                    position: {
                        x: 0.9430001,
                        y: -24.15,
                    }
                },
                {
                    name: "Boiler Room: Open Waterways",
                    usableDistance: 1,
                    position: {
                        x: 18.4170017,
                        y: -23.72,
                    }
                }
            ]
        },
        [TaskType.MonitorO2]: {
            name: "Monitor Tree",
            type: TaskType.MonitorO2,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Hallway: Monitor Tree",
                    usableDistance: 1,
                    position: {
                        x: 1.654,
                        y: -16.012001,
                    }
                }
            ]
        },
        [TaskType.FillCanisters]: {
            name: "Fill Canisters",
            type: TaskType.FillCanisters,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "O2: Fill Canisters",
                    usableDistance: 0.6,
                    position: {
                        x: 1.14319611,
                        y: -19.5258732,
                    }
                }
            ]
        },
        [TaskType.ClearAsteroids]: {
            name: "Clear Asteroids",
            type: TaskType.ClearAsteroids,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Weapons: Clear Asteroids",
                    usableDistance: 1,
                    position: {
                        x: 9.929073,
                        y: -22.3909931,
                    }
                }
            ]
        },
        [TaskType.UploadData]: {
            name: "Upload Data",
            type: TaskType.UploadData,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Communications: Upload Data",
                    usableDistance: 1,
                    position: {
                        x: 11.71978,
                        y: -15.1451921,
                    }
                }
            ]
        },
        [TaskType.RebootWifi]: {
            name: "Reboot Wifi",
            type: TaskType.RebootWifi,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Communications: Reboot Wifi",
                    usableDistance: 1,
                    position: {
                        x: 11.0479994,
                        y: -15.2979116,
                    }
                }
            ]
        },
        [TaskType.ScanBoardingPass]: {
            name: "Scan Boarding Pass",
            type: TaskType.ScanBoardingPass,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Office: Scan Boarding Pass",
                    usableDistance: 1,
                    position: {
                        x: 25.75001,
                        y: -16.03081,
                    }
                }
            ]
        },
        [TaskType.SwipeCard]: {
            name: "Swipe Card",
            type: TaskType.SwipeCard,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Office: Swipe Card",
                    usableDistance: 1,
                    position: {
                        x: 24.8164444,
                        y: -16.2175217,
                    }
                }
            ]
        },
        [TaskType.StoreArtifacts]: {
            name: "Store Artifacts",
            type: TaskType.StoreArtifacts,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Specimen Room: Store Artifacts",
                    usableDistance: 1,
                    position: {
                        x: 36.4811172,
                        y: -18.82867,
                    }
                }
            ]
        },
        [TaskType.StartReactor]: {
            name: "Start Reactor",
            type: TaskType.StartReactor,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Specimen Room: Start Reactor",
                    usableDistance: 1,
                    position: {
                        x: 34.7577744,
                        y: -18.8785362,
                    }
                }
            ]
        },
        [TaskType.UnlockManifolds]: {
            name: "Unlock Manifolds",
            type: TaskType.UnlockManifolds,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Specimen Room: Unlock Manifolds",
                    usableDistance: 1,
                    position: {
                        x: 34.3813057,
                        y: -19.4866753,
                    }
                }
            ]
        },
        [TaskType.SubmitScan]: {
            name: "Submit Scan",
            type: TaskType.SubmitScan,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "MedBay: Submit Scan",
                    usableDistance: 1,
                    position: {
                        x: 40.3270035,
                        y: -7.082,
                    }
                }
            ]
        },
        [TaskType.RepairDrill]: {
            name: "Repair Drill",
            type: TaskType.RepairDrill,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Laboratory: Repair Drill",
                    usableDistance: 1,
                    position: {
                        x: 27.42095,
                        y: -6.982279,
                    }
                }
            ]
        },
        [TaskType.InspectSample]: {
            name: "Inspect Sample",
            type: TaskType.InspectSample,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Hallway: Inspect Sample",
                    usableDistance: 1,
                    position: {
                        x: 36.52848,
                        y: -5.56934738,
                    }
                }
            ]
        },
        [TaskType.AlignTelescope]: {
            name: "Align Telescope",
            type: TaskType.AlignTelescope,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Laboratory: Align Telescope",
                    usableDistance: 1,
                    position: {
                        x: 33.8684273,
                        y: -5.47126532,
                    }
                }
            ]
        },
        [TaskType.RecordTemperature]: {
            name: "Record Temperature",
            type: TaskType.RecordTemperature,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Laboratory: Record Temperature",
                    usableDistance: 1,
                    position: {
                        x: 31.34464,
                        y: -6.67142,
                    }
                },
                {
                    name: "Outside: Record Temperature",
                    usableDistance: 1,
                    position: {
                        x: 30.93255,
                        y: -15.324791,
                    }
                }
            ]
        },
        [TaskType.ActivateWeatherNodes]: {
            name: "Exit",
            type: TaskType.ActivateWeatherNodes,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Hallway: Exit",
                    usableDistance: 1,
                    position: {
                        x: 23.04,
                        y: -6.94,
                    }
                },
                {
                    name: "Hallway: Exit",
                    usableDistance: 1,
                    position: {
                        x: 8.37,
                        y: -15.46,
                    }
                },
                {
                    name: "Hallway: Exit",
                    usableDistance: 1,
                    position: {
                        x: 7.16,
                        y: -25.36,
                    }
                },
                {
                    name: "Hallway: Exit",
                    usableDistance: 1,
                    position: {
                        x: 14.96,
                        y: -25.44,
                    }
                },
                {
                    name: "Hallway: Exit",
                    usableDistance: 1,
                    position: {
                        x: 14.48,
                        y: -12.17,
                    }
                },
                {
                    name: "Hallway: Exit",
                    usableDistance: 1,
                    position: {
                        x: 30.86,
                        y: -12.23,
                    }
                }
            ]
        },
        [TaskType.ChartCourse]: {
            name: "Chart Course",
            type: TaskType.ChartCourse,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Dropship: Chart Course",
                    usableDistance: 1,
                    position: {
                        x: 15.9748106,
                        y: 0.08402014,
                    }
                }
            ]
        },
        [TaskType.InsertKeys]: {
            name: "Insert Keys",
            type: TaskType.InsertKeys,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Dropship: Insert Keys",
                    usableDistance: 1,
                    position: {
                        x: 17.38076,
                        y: 0.08402014,
                    }
                }
            ]
        }
    },
    [GameMap.AprilFoolsTheSkeld]: {},
    [GameMap.Airship]: {
        [TaskType.StabilizeSteering]: {
            name: "Stabilize Steering",
            type: TaskType.StabilizeSteering,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Cockpit: Stabilize Steering",
                    usableDistance: 1,
                    position: {
                        x: -19.6769981,
                        y: -0.791,
                    }
                }
            ]
        },
        [TaskType.FixWiring]: {
            name: "Fix Wiring",
            type: TaskType.FixWiring,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Engine Room: Fix Wiring",
                    usableDistance: 0.7,
                    position: {
                        x: -7.021,
                        y: 1.49099994,
                    }
                },
                {
                    name: "Viewing Deck: Fix Wiring",
                    usableDistance: 0.7,
                    position: {
                        x: -10.290699,
                        y: -11.3343983,
                    }
                },
                {
                    name: "Main Hall: Fix Wiring",
                    usableDistance: 0.7,
                    position: {
                        x: 16.212,
                        y: 2.86300039,
                    }
                },
                {
                    name: "Showers: Fix Wiring",
                    usableDistance: 0.7,
                    position: {
                        x: 17.0821,
                        y: 5.481,
                    }
                },
                {
                    name: "Lounge: Fix Wiring",
                    usableDistance: 0.7,
                    position: {
                        x: 27.3574,
                        y: 10.388,
                    }
                },
                {
                    name: "Cargo Bay: Fix Wiring",
                    usableDistance: 0.7,
                    position: {
                        x: 35.154,
                        y: 3.91299963,
                    }
                },
                {
                    name: "Meeting Room: Fix Wiring",
                    usableDistance: 0.7,
                    position: {
                        x: 14.0770006,
                        y: 16.4849987,
                    }
                }
            ]
        },
        [TaskType.PolishRuby]: {
            name: "Polish Ruby",
            type: TaskType.PolishRuby,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Vault: Polish Ruby",
                    usableDistance: 1,
                    position: {
                        x: -8.851499,
                        y: 9.065,
                    }
                }
            ]
        },
        [TaskType.DressMannequin]: {
            name: "Dress Mannequin",
            type: TaskType.DressMannequin,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Vault: Dress Mannequin",
                    usableDistance: 1,
                    position: {
                        x: -7.38429832,
                        y: 6.43019962,
                    }
                }
            ]
        },
        [TaskType.MakeBurger]: {
            name: "Make Burger",
            type: TaskType.MakeBurger,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Kitchen: Make Burger",
                    usableDistance: 1,
                    position: {
                        x: -5.1793,
                        y: -8.5239,
                    }
                }
            ]
        },
        [TaskType.UploadData]: {
            name: "Upload Data",
            type: TaskType.UploadData,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Viewing Deck: Upload Data",
                    usableDistance: 1,
                    position: {
                        x: -14.4641,
                        y: -16.387701,
                    }
                },
                {
                    name: "Viewing Deck: Upload Data",
                    usableDistance: 1,
                    position: {
                        x: 10.4685,
                        y: -16.218298,
                    }
                }
            ]
        },
        [TaskType.DevelopPhotos]: {
            name: "Develop Photos",
            type: TaskType.DevelopPhotos,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Main Hall: Develop Photos",
                    usableDistance: 1,
                    position: {
                        x: 13.527709,
                        y: 2.34949136,
                    }
                }
            ]
        },
        [TaskType.Decontaminate]: {
            name: "Decontaminate",
            type: TaskType.Decontaminate,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Main Hall: Decontaminate",
                    usableDistance: 1,
                    position: {
                        x: 14.7915564,
                        y: 3.70299983,
                    }
                },
                {
                    name: "Hallway: Decontaminate",
                    usableDistance: 0.8,
                    position: {
                        x: 14.7915564,
                        y: 3.70299983,
                    }
                }
            ]
        },
        [TaskType.PickUpTowels]: {
            name: "Pick Up Towels",
            type: TaskType.PickUpTowels,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 17.3159,
                        y: 4.74695349,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 20.3819,
                        y: 4.57099962,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 21.8169,
                        y: 2.464,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 18.8489017,
                        y: -0.909999967,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 24.0359,
                        y: -2.18399978,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 20.5499,
                        y: -1.736,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 22.0129,
                        y: -1.428,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 20.0809,
                        y: -0.04199996,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 19.1849,
                        y: 3.36699986,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 22.9649,
                        y: 0.0559999458,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 18.134901,
                        y: 2.072,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 23.0418987,
                        y: -1.491,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 22.9173012,
                        y: -1.35240006,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 23.1231,
                        y: -1.4,
                    }
                },
                {
                    name: "Showers: Pick Up Towels",
                    usableDistance: 1,
                    position: {
                        x: 18.7929,
                        y: 5.138,
                    }
                }
            ]
        },
        [TaskType.FixShower]: {
            name: "Fix Shower",
            type: TaskType.FixShower,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Showers: Fix Shower",
                    usableDistance: 1,
                    position: {
                        x: 20.8159,
                        y: 3.27599978,
                    }
                }
            ]
        },
        [TaskType.SortRecords]: {
            name: "Sort Records",
            type: TaskType.SortRecords,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 17.9353981,
                        y: 11.4016,
                    }
                },
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 21.8547,
                        y: 11.4163,
                    }
                },
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 19.8938465,
                        y: 9.273678,
                    }
                },
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 18.6878967,
                        y: 12.503397,
                    }
                },
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 19.2549,
                        y: 12.7015,
                    }
                },
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 20.5196018,
                        y: 12.7189989,
                    }
                },
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 21.1070976,
                        y: 12.5278969,
                    }
                },
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 21.5992,
                        y: 7.07,
                    }
                },
                {
                    name: "Records: Sort Records",
                    usableDistance: 1,
                    position: {
                        x: 18.1866989,
                        y: 7.0651,
                    }
                }
            ]
        },
        [TaskType.CleanToilet]: {
            name: "Clean Toilet",
            type: TaskType.CleanToilet,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Lounge: Clean Toilet",
                    usableDistance: 1,
                    position: {
                        x: 29.191824,
                        y: 7.739511,
                    }
                },
                {
                    name: "Lounge: Clean Toilet",
                    usableDistance: 1,
                    position: {
                        x: 30.8083954,
                        y: 7.72099972,
                    }
                },
                {
                    name: "Lounge: Clean Toilet",
                    usableDistance: 1,
                    position: {
                        x: 32.320076,
                        y: 7.764191,
                    }
                },
                {
                    name: "Lounge: Clean Toilet",
                    usableDistance: 1,
                    position: {
                        x: 33.7358627,
                        y: 7.791699,
                    }
                }
            ]
        },
        [TaskType.RewindTapes]: {
            name: "Rewind Tapes",
            type: TaskType.RewindTapes,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Security: Rewind Tapes",
                    usableDistance: 1.4,
                    position: {
                        x: 8.1305,
                        y: -11.5352983,
                    }
                }
            ]
        },
        [TaskType.UnlockSafe]: {
            name: "Unlock Safe",
            type: TaskType.UnlockSafe,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Cargo Bay: Unlock Safe",
                    usableDistance: 1,
                    position: {
                        x: 36.302,
                        y: -2.688,
                    }
                }
            ]
        },
        [TaskType.CalibrateDistributor]: {
            name: "Calibrate Distributor",
            type: TaskType.CalibrateDistributor,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Electrical: Calibrate Distributor",
                    usableDistance: 1,
                    position: {
                        x: 16.346632,
                        y: -5.49989939,
                    }
                }
            ]
        },
        [TaskType.DivertPower]: {
            name: "Exit",
            type: TaskType.DivertPower,
            length: TaskLength.Short,
            consoles: [
                {
                    name: "Electrical: Exit",
                    usableDistance: 1,
                    position: {
                        x: 17.59529,
                        y: -3.7142,
                    }
                }
            ]
        },
        [TaskType.ResetBreakers]: {
            name: "Reset Breakers",
            type: TaskType.ResetBreakers,
            length: TaskLength.Long,
            consoles: [
                {
                    name: "Electrical: Reset Breakers",
                    usableDistance: 1,
                    position: {
                        x: 17.29,
                        y: -10.1535,
                    }
                },
                {
                    name: "Electrical: Reset Breakers",
                    usableDistance: 1,
                    position: {
                        x: 20.267416,
                        y: -10.1535,
                    }
                },
                {
                    name: "Electrical: Reset Breakers",
                    usableDistance: 1,
                    position: {
                        x: 18.424,
                        y: -7.7385,
                    }
                },
                {
                    name: "Electrical: Reset Breakers",
                    usableDistance: 1,
                    position: {
                        x: 17.29,
                        y: -7.7385,
                    }
                },
                {
                    name: "Electrical: Reset Breakers",
                    usableDistance: 1,
                    position: {
                        x: 12.3340006,
                        y: -7.7385,
                    }
                },
                {
                    name: "Electrical: Reset Breakers",
                    usableDistance: 1,
                    position: {
                        x: 18.417,
                        y: -5.3375,
                    }
                },
                {
                    name: "Electrical: Reset Breakers",
                    usableDistance: 1,
                    position: {
                        x: 15.3650007,
                        y: -7.7385,
                    }
                }
            ]
        },
        [TaskType.EnterIdCode]: {
            name: "Enter Id Code",
            type: TaskType.EnterIdCode,
            length: TaskLength.Common,
            consoles: [
                {
                    name: "Cockpit: Enter Id Code",
                    usableDistance: 1,
                    position: {
                        x: 16.2014275,
                        y: 16.331,
                    }
                }
            ]
        }
    }
};
