/*
    Generated using https://github.com/skeldjs/SkeldJS/tree/master/packages/data/scripts/maps.js
    Data dumped from https://github.com/js6pak/Dumpostor

    Copyright (C) 2021  Edward Smale

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { TaskLength, TaskType } from "@skeldjs/constant";

interface ConsoleDataModel {
    index: number;
    usableDistance: number;
    position: {
        x: number;
        y: number;
    };
}

interface TaskDataModel {
    index: number;
    hudText: string;
    taskType: TaskType;
    length: TaskLength;
    consoles: Record<number, ConsoleDataModel>;
}

export const PolusTasks: Record<number, TaskDataModel> = {
    0: {
        index: 0,
        hudText: "Office: Swipe Card",
        taskType: TaskType.SwipeCard,
        length: TaskLength.Common,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 24.8164444,
                    y: -16.2175217
                }
            }
        ]
    },
    1: {
        index: 1,
        hudText: "Dropship: Insert Keys",
        taskType: TaskType.InsertKeys,
        length: TaskLength.Common,
        consoles: [
            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 17.3807602,
                    y: 0.0840201378
                }
            }
        ]
    },
    2: {
        index: 2,
        hudText: "Office: Scan Boarding Pass",
        taskType: TaskType.ScanBoardingPass,
        length: TaskLength.Common,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 25.7500095,
                    y: -16.0308094
                }
            }
        ]
    },
    3: {
        index: 3,
        hudText: "Electrical: Fix Wiring ({0}/3)",
        taskType: TaskType.FixWiring,
        length: TaskLength.Common,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 3.06727982,
                    y: -8.69147587
                }
            },            {
                index: 1,
                usableDistance: 0.769999981,
                position: {
                    x: 6.49900007,
                    y: -18.4580002
                }
            },            {
                index: 2,
                usableDistance: 0.800000012,
                position: {
                    x: 16.3737488,
                    y: -18.5055885
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 40.6100006,
                    y: -8.96000004
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 37.321003,
                    y: -8.94400024
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 32.9750023,
                    y: -9.03136539
                }
            }
        ]
    },
    4: {
        index: 4,
        hudText: "Weapons: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 11.71978,
                    y: -15.1451921
                }
            }
        ]
    },
    5: {
        index: 5,
        hudText: "Office: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 11.71978,
                    y: -15.1451921
                }
            }
        ]
    },
    6: {
        index: 6,
        hudText: "Electrical: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 11.71978,
                    y: -15.1451921
                }
            }
        ]
    },
    7: {
        index: 7,
        hudText: "Specimen Room: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 11.71978,
                    y: -15.1451921
                }
            }
        ]
    },
    8: {
        index: 8,
        hudText: "O2: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 11.71978,
                    y: -15.1451921
                }
            }
        ]
    },
    9: {
        index: 9,
        hudText: "Specimen Room: Start Reactor",
        taskType: TaskType.StartReactor,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 34.7577744,
                    y: -18.8785362
                }
            }
        ]
    },
    10: {
        index: 10,
        hudText: "Storage: Fuel Engines ({0}/2)",
        taskType: TaskType.FuelEngines,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    11: {
        index: 11,
        hudText: "Boiler Room: Open Waterways ({0}/3)",
        taskType: TaskType.OpenWaterways,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 3.66899991,
                    y: -24.1499996
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 0.943000078,
                    y: -24.1499996
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 18.4170017,
                    y: -23.7199993
                }
            }
        ]
    },
    12: {
        index: 12,
        hudText: "MedBay: Inspect Sample",
        taskType: TaskType.InspectSample,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 36.5284805,
                    y: -5.56934738
                }
            }
        ]
    },
    13: {
        index: 13,
        hudText: "Boiler Room: Replace Water Jug ({0}/2)",
        taskType: TaskType.ReplaceWaterJug,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    14: {
        index: 14,
        hudText: "Node_GI: Fix Weather Node ({0}/2)",
        taskType: TaskType.ActivateWeatherNodes,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 23.0400009,
                    y: -6.94000006
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 8.36999989,
                    y: -15.46
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 7.15999985,
                    y: -25.3600006
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 14.96,
                    y: -25.4400005
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 14.4799995,
                    y: -12.1700001
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 30.8600006,
                    y: -12.2299995
                }
            }
        ]
    },
    15: {
        index: 15,
        hudText: "Node_IRO: Fix Weather Node ({0}/2)",
        taskType: TaskType.ActivateWeatherNodes,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 23.0400009,
                    y: -6.94000006
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 8.36999989,
                    y: -15.46
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 7.15999985,
                    y: -25.3600006
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 14.96,
                    y: -25.4400005
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 14.4799995,
                    y: -12.1700001
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 30.8600006,
                    y: -12.2299995
                }
            }
        ]
    },
    16: {
        index: 16,
        hudText: "Node_PD: Fix Weather Node ({0}/2)",
        taskType: TaskType.ActivateWeatherNodes,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 23.0400009,
                    y: -6.94000006
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 8.36999989,
                    y: -15.46
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 7.15999985,
                    y: -25.3600006
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 14.96,
                    y: -25.4400005
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 14.4799995,
                    y: -12.1700001
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 30.8600006,
                    y: -12.2299995
                }
            }
        ]
    },
    17: {
        index: 17,
        hudText: "Node_TB: Fix Weather Node ({0}/2)",
        taskType: TaskType.ActivateWeatherNodes,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 23.0400009,
                    y: -6.94000006
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 8.36999989,
                    y: -15.46
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 7.15999985,
                    y: -25.3600006
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 14.96,
                    y: -25.4400005
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 14.4799995,
                    y: -12.1700001
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 30.8600006,
                    y: -12.2299995
                }
            }
        ]
    },
    18: {
        index: 18,
        hudText: "Communications: Reboot Wifi",
        taskType: TaskType.RebootWifi,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 11.0479994,
                    y: -15.2979116
                }
            }
        ]
    },
    19: {
        index: 19,
        hudText: "O2: Monitor Tree",
        taskType: TaskType.MonitorO2,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 1.65400004,
                    y: -16.012001
                }
            }
        ]
    },
    20: {
        index: 20,
        hudText: "Specimen Room: Unlock Manifolds",
        taskType: TaskType.UnlockManifolds,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 34.3813057,
                    y: -19.4866753
                }
            }
        ]
    },
    21: {
        index: 21,
        hudText: "Specimen Room: Store Artifacts",
        taskType: TaskType.StoreArtifacts,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 36.4811172,
                    y: -18.8286705
                }
            }
        ]
    },
    22: {
        index: 22,
        hudText: "O2: Fill Canisters",
        taskType: TaskType.FillCanisters,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 0.600000024,
                position: {
                    x: 1.14319611,
                    y: -19.5258732
                }
            }
        ]
    },
    23: {
        index: 23,
        hudText: "O2: Empty Garbage",
        taskType: TaskType.EmptyGarbage,
        length: TaskLength.Long,
        consoles: [

        ]
    },
    24: {
        index: 24,
        hudText: "Dropship: Chart Course",
        taskType: TaskType.ChartCourse,
        length: TaskLength.Long,
        consoles: [
            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 15.9748106,
                    y: 0.0840201378
                }
            }
        ]
    },
    25: {
        index: 25,
        hudText: "MedBay: Submit Scan",
        taskType: TaskType.SubmitScan,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 40.3270035,
                    y: -7.08199978
                }
            }
        ]
    },
    26: {
        index: 26,
        hudText: "Weapons: Clear Asteroids ({0}/20)",
        taskType: TaskType.ClearAsteroids,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 9.92907333,
                    y: -22.3909931
                }
            }
        ]
    },
    27: {
        index: 27,
        hudText: "Node_CA: Fix Weather Node ({0}/2)",
        taskType: TaskType.ActivateWeatherNodes,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 23.0400009,
                    y: -6.94000006
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 8.36999989,
                    y: -15.46
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 7.15999985,
                    y: -25.3600006
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 14.96,
                    y: -25.4400005
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 14.4799995,
                    y: -12.1700001
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 30.8600006,
                    y: -12.2299995
                }
            }
        ]
    },
    28: {
        index: 28,
        hudText: "Node_MLG: Fix Weather Node ({0}/2)",
        taskType: TaskType.ActivateWeatherNodes,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 23.0400009,
                    y: -6.94000006
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 8.36999989,
                    y: -15.46
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 7.15999985,
                    y: -25.3600006
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 14.96,
                    y: -25.4400005
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 14.4799995,
                    y: -12.1700001
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 30.8600006,
                    y: -12.2299995
                }
            }
        ]
    },
    29: {
        index: 29,
        hudText: "Laboratory: Align Telescope",
        taskType: TaskType.AlignTelescope,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 33.8684273,
                    y: -5.47126532
                }
            }
        ]
    },
    30: {
        index: 30,
        hudText: "Laboratory: Repair Drill",
        taskType: TaskType.RepairDrill,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 27.4209499,
                    y: -6.98227882
                }
            }
        ]
    },
    31: {
        index: 31,
        hudText: "Laboratory: Record Temperature",
        taskType: TaskType.RecordTemperature,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 31.3446407,
                    y: -6.6714201
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 30.9325504,
                    y: -15.324791
                }
            }
        ]
    },
    32: {
        index: 32,
        hudText: "Outside: Record Temperature",
        taskType: TaskType.RecordTemperature,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 31.3446407,
                    y: -6.6714201
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 30.9325504,
                    y: -15.324791
                }
            }
        ]
    }
};