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
import { TaskInfo } from "../types/TaskInfo";

export const MiraHQTasks: Record<number, TaskInfo> = {
    0: {
        index: 0,
        hudText: "Storage: Fix Wiring ({0}/3)",
        taskType: TaskType.FixWiring,
        length: TaskLength.Common,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 18.3899994,
                    y: 1.20000005
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 12.0959997,
                    y: 8.03999996
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 6.125,
                    y: 14.9580002
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 4.35599947,
                    y: 2.53400016
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 16.9800014,
                    y: 21.3939991
                }
            }
        ]
    },
    1: {
        index: 1,
        hudText: "Admin: Enter Id Code",
        taskType: TaskType.EnterIdCode,
        length: TaskLength.Common,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 19.894001,
                    y: 19.0240002
                }
            }
        ]
    },
    2: {
        index: 2,
        hudText: "MedBay: Submit Scan",
        taskType: TaskType.SubmitScan,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 16.2329998,
                    y: 0.261999995
                }
            }
        ]
    },
    3: {
        index: 3,
        hudText: "Balcony: Clear Asteroids ({0}/20)",
        taskType: TaskType.ClearAsteroids,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1.79999995,
                position: {
                    x: 19.2129993,
                    y: -2.41400003
                }
            }
        ]
    },
    4: {
        index: 4,
        hudText: "Reactor: Divert Power to Admin ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 0.77700007,
                    y: 11.4840002
                }
            }
        ]
    },
    5: {
        index: 5,
        hudText: "Reactor: Divert Power to Cafeteria ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 0.77700007,
                    y: 11.4840002
                }
            }
        ]
    },
    6: {
        index: 6,
        hudText: "Reactor: Divert Power to Communications ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 0.77700007,
                    y: 11.4840002
                }
            }
        ]
    },
    7: {
        index: 7,
        hudText: "Reactor: Divert Power to Launchpad ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 0.77700007,
                    y: 11.4840002
                }
            }
        ]
    },
    8: {
        index: 8,
        hudText: "Reactor: Divert Power to MedBay ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 0.77700007,
                    y: 11.4840002
                }
            }
        ]
    },
    9: {
        index: 9,
        hudText: "Reactor: Divert Power to Office ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 0.77700007,
                    y: 11.4840002
                }
            }
        ]
    },
    10: {
        index: 10,
        hudText: "Storage: Water Plants ({0}/2)",
        taskType: TaskType.WaterPlants,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    11: {
        index: 11,
        hudText: "Reactor: Start Reactor",
        taskType: TaskType.StartReactor,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 2.54900002,
                    y: 12.4070005
                }
            }
        ]
    },
    12: {
        index: 12,
        hudText: "Reactor: Divert Power to Greenhouse ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 0.77700007,
                    y: 11.4840002
                }
            }
        ]
    },
    13: {
        index: 13,
        hudText: "Admin: Chart Course",
        taskType: TaskType.ChartCourse,
        length: TaskLength.Long,
        consoles: [

        ]
    },
    14: {
        index: 14,
        hudText: "Greenhouse: Clean O2 Filter",
        taskType: TaskType.CleanO2Filter,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 2,
                position: {
                    x: 17.2210007,
                    y: 24.5050011
                }
            }
        ]
    },
    15: {
        index: 15,
        hudText: "Launchpad: Fuel Engines",
        taskType: TaskType.FuelEngines,
        length: TaskLength.Long,
        consoles: [

        ]
    },
    16: {
        index: 16,
        hudText: "Laboratory: Assemble Artifact",
        taskType: TaskType.AssembleArtifact,
        length: TaskLength.Long,
        consoles: [
            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 9.40200043,
                    y: 14.5680008
                }
            }
        ]
    },
    17: {
        index: 17,
        hudText: "Laboratory: Sort Samples",
        taskType: TaskType.SortSamples,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 9.6600008,
                    y: 11.1150007
                }
            }
        ]
    },
    18: {
        index: 18,
        hudText: "Admin: Prime Shields",
        taskType: TaskType.PrimeShields,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 21.1690006,
                    y: 17.9449997
                }
            }
        ]
    },
    19: {
        index: 19,
        hudText: "Cafeteria: Empty Garbage",
        taskType: TaskType.EmptyGarbage,
        length: TaskLength.Long,
        consoles: [

        ]
    },
    20: {
        index: 20,
        hudText: "Balcony: Measure Weather",
        taskType: TaskType.MeasureWeather,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 28.9119987,
                    y: -1.70099998
                }
            }
        ]
    },
    21: {
        index: 21,
        hudText: "Reactor: Divert Power to Laboratory ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 0.77700007,
                    y: 11.4840002
                }
            }
        ]
    },
    22: {
        index: 22,
        hudText: "Cafeteria: Buy Beverage",
        taskType: TaskType.BuyBeverage,
        length: TaskLength.Long,
        consoles: [
            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 27.4899998,
                    y: 5.66499996
                }
            }
        ]
    },
    23: {
        index: 23,
        hudText: "Office: Process Data",
        taskType: TaskType.ProcessData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 15.776001,
                    y: 21.4029999
                }
            }
        ]
    },
    24: {
        index: 24,
        hudText: "Launchpad: Run Diagnostics",
        taskType: TaskType.RunDiagnostics,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1.5,
                position: {
                    x: -2.49900007,
                    y: 1.87300014
                }
            }
        ]
    },
    25: {
        index: 25,
        hudText: "Reactor: Unlock Manifolds",
        taskType: TaskType.UnlockManifolds,
        length: TaskLength.Long,
        consoles: [
            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 0.442000151,
                    y: 13.2560005
                }
            }
        ]
    },
    26: {
        index: 26,
        hudText: "Balcony: Clean Vent",
        taskType: TaskType.ViewingDeck,
        length: TaskLength.Long,
        consoles: [
            {
                index: 11,
                usableDistance: 1,
                position: {
                    x: -6.18000031,
                    y: 3.56000018
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 23.7699986,
                    y: -1.93999994
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 23.8999996,
                    y: 7.18000031
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 0.480000138,
                    y: 10.6970005
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 11.6060009,
                    y: 13.816
                }
            },            {
                index: 10,
                usableDistance: 1,
                position: {
                    x: 4.28999996,
                    y: 0.529999733
                }
            },            {
                index: 6,
                usableDistance: 1,
                position: {
                    x: 22.3900013,
                    y: 17.2299995
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 13.2800007,
                    y: 20.1299992
                }
            },            {
                index: 7,
                usableDistance: 1,
                position: {
                    x: 17.8500004,
                    y: 25.2299995
                }
            },            {
                index: 8,
                usableDistance: 1,
                position: {
                    x: 15.4099998,
                    y: -1.81999969
                }
            },            {
                index: 9,
                usableDistance: 1,
                position: {
                    x: 6.82999992,
                    y: 3.14499998
                }
            }
        ]
    }
};
