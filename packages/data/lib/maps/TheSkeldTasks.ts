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

export const TheSkeldTasks: Record<number, TaskInfo> = {
    0: {
        index: 0,
        hudText: "Admin: Swipe Card",
        taskType: TaskType.SwipeCard,
        length: TaskLength.Common,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 5.6352005,
                    y: -8.63280106
                }
            }
        ]
    },
    1: {
        index: 1,
        hudText: "Electrical: Fix Wiring ({0}/3)",
        taskType: TaskType.FixWiring,
        length: TaskLength.Common,
        consoles: [
            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 1.39199996,
                    y: -6.40920019
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: -5.28119946,
                    y: 5.24639988
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 14.5199995,
                    y: -3.77400017
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -7.72799969,
                    y: -7.66680002
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: -1.93200004,
                    y: -8.72039986
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: -15.5592003,
                    y: -4.5923996
                }
            }
        ]
    },
    2: {
        index: 2,
        hudText: "Weapons: Clear Asteroids ({0}/20)",
        taskType: TaskType.ClearAsteroids,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1.20000005,
                position: {
                    x: 9.08760071,
                    y: 1.81200004
                }
            }
        ]
    },
    3: {
        index: 3,
        hudText: "Upper Engine: Align Engine Output ({0}/2)",
        taskType: TaskType.AlignEngineOutput,
        length: TaskLength.Short,
        consoles: [
            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: -19.1507988,
                    y: -12.618
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -19.1760006,
                    y: -0.414422125
                }
            }
        ]
    },
    4: {
        index: 4,
        hudText: "MedBay: Submit Scan",
        taskType: TaskType.SubmitScan,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -7.32840014,
                    y: -5.24760056
                }
            }
        ]
    },
    5: {
        index: 5,
        hudText: "MedBay: Inspect Sample",
        taskType: TaskType.InspectSample,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -6.14400005,
                    y: -4.25999975
                }
            }
        ]
    },
    6: {
        index: 6,
        hudText: "Storage: Fuel Engines ({0}/2)",
        taskType: TaskType.FuelEngines,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    7: {
        index: 7,
        hudText: "Reactor: Start Reactor",
        taskType: TaskType.StartReactor,
        length: TaskLength.Short,
        consoles: [
            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: -21.7919998,
                    y: -5.57280016
                }
            }
        ]
    },
    8: {
        index: 8,
        hudText: "O2: Empty Chute ({0}/2)",
        taskType: TaskType.EmptyChute,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    9: {
        index: 9,
        hudText: "Cafeteria: Empty Garbage ({0}/2)",
        taskType: TaskType.EmptyGarbage,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    10: {
        index: 10,
        hudText: "Communications: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 2.50799966,
                    y: -6.26520061
                }
            }
        ]
    },
    11: {
        index: 11,
        hudText: "Electrical: Calibrate Distributor",
        taskType: TaskType.CalibrateDistributor,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -5.86440039,
                    y: -7.47720003
                }
            }
        ]
    },
    12: {
        index: 12,
        hudText: "Navigation: Chart Course",
        taskType: TaskType.ChartCourse,
        length: TaskLength.Long,
        consoles: [

        ]
    },
    13: {
        index: 13,
        hudText: "O2: Clean O2 Filter",
        taskType: TaskType.CleanO2Filter,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 0.800000012,
                position: {
                    x: 5.74319983,
                    y: -2.97720003
                }
            }
        ]
    },
    14: {
        index: 14,
        hudText: "Reactor: Unlock Manifolds",
        taskType: TaskType.UnlockManifolds,
        length: TaskLength.Long,
        consoles: [
            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: -22.5360012,
                    y: -2.49959993
                }
            }
        ]
    },
    15: {
        index: 15,
        hudText: "Electrical: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 2.50799966,
                    y: -6.26520061
                }
            }
        ]
    },
    16: {
        index: 16,
        hudText: "Navigation: Stabilize Steering",
        taskType: TaskType.StabilizeSteering,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1.25,
                position: {
                    x: 18.7320004,
                    y: -4.72800016
                }
            }
        ]
    },
    17: {
        index: 17,
        hudText: "Weapons: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 2.50799966,
                    y: -6.26520061
                }
            }
        ]
    },
    18: {
        index: 18,
        hudText: "Shields: Prime Shields",
        taskType: TaskType.PrimeShields,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 7.52639914,
                    y: -13.9811993
                }
            }
        ]
    },
    19: {
        index: 19,
        hudText: "Cafeteria: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 2.50799966,
                    y: -6.26520061
                }
            }
        ]
    },
    20: {
        index: 20,
        hudText: "Navigation: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 2.50799966,
                    y: -6.26520061
                }
            }
        ]
    },
    21: {
        index: 21,
        hudText: "Electrical: Divert Power to Shields ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -9,
                    y: -7.29360056
                }
            }
        ]
    },
    22: {
        index: 22,
        hudText: "Electrical: Divert Power to Weapons ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -9,
                    y: -7.29360056
                }
            }
        ]
    },
    23: {
        index: 23,
        hudText: "Electrical: Divert Power to Communications ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -9,
                    y: -7.29360056
                }
            }
        ]
    },
    24: {
        index: 24,
        hudText: "Electrical: Divert Power to Upper Engine ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -9,
                    y: -7.29360056
                }
            }
        ]
    },
    25: {
        index: 25,
        hudText: "Electrical: Divert Power to O2 ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -9,
                    y: -7.29360056
                }
            }
        ]
    },
    26: {
        index: 26,
        hudText: "Electrical: Divert Power to Navigation ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -9,
                    y: -7.29360056
                }
            }
        ]
    },
    27: {
        index: 27,
        hudText: "Electrical: Divert Power to Lower Engine ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -9,
                    y: -7.29360056
                }
            }
        ]
    },
    28: {
        index: 28,
        hudText: "Electrical: Divert Power to Security ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -9,
                    y: -7.29360056
                }
            }
        ]
    },
    29: {
        index: 29,
        hudText: "Security: Clean Vent",
        taskType: TaskType.ViewingDeck,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 2.54399991,
                    y: -9.95520115
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 4.25880003,
                    y: -0.276000023
                }
            },            {
                index: 13,
                usableDistance: 1,
                position: {
                    x: 16.0080013,
                    y: -6.3840003
                }
            },            {
                index: 12,
                usableDistance: 1,
                position: {
                    x: 16.0080013,
                    y: -3.16800022
                }
            },            {
                index: 7,
                usableDistance: 1,
                position: {
                    x: 8.82000065,
                    y: 3.32400012
                }
            },            {
                index: 10,
                usableDistance: 1,
                position: {
                    x: 9.52320004,
                    y: -14.3376007
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 9.38399982,
                    y: -6.4380002
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: -9.77639961,
                    y: -8.0340004
                }
            },            {
                index: 8,
                usableDistance: 1,
                position: {
                    x: -20.7960014,
                    y: -6.95280027
                }
            },            {
                index: 11,
                usableDistance: 1,
                position: {
                    x: -21.8759995,
                    y: -3.05160022
                }
            },            {
                index: 9,
                usableDistance: 1,
                position: {
                    x: -15.2508001,
                    y: -13.6560011
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: -15.2880001,
                    y: 2.51999998
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: -12.5340004,
                    y: -6.94920015
                }
            },            {
                index: 6,
                usableDistance: 1,
                position: {
                    x: -10.6080008,
                    y: -4.17600012
                }
            }
        ]
    }
};
