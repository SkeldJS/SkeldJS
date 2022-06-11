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

export const AirshipTasks: Record<number, TaskInfo> = {
    0: {
        index: 0,
        hudText: "Viewing Deck: Fix Wiring ({0}/3)",
        taskType: TaskType.FixWiring,
        length: TaskLength.Common,
        consoles: [
            {
                index: 1,
                usableDistance: 0.699999988,
                position: {
                    x: -7.02099991,
                    y: 1.49099994
                }
            },            {
                index: 0,
                usableDistance: 0.699999988,
                position: {
                    x: -10.290699,
                    y: -11.3343983
                }
            },            {
                index: 2,
                usableDistance: 0.699999988,
                position: {
                    x: 16.2119999,
                    y: 2.86300039
                }
            },            {
                index: 3,
                usableDistance: 0.699999988,
                position: {
                    x: 17.0820999,
                    y: 5.48099995
                }
            },            {
                index: 4,
                usableDistance: 0.699999988,
                position: {
                    x: 27.3574009,
                    y: 10.3879995
                }
            },            {
                index: 5,
                usableDistance: 0.699999988,
                position: {
                    x: 35.1539993,
                    y: 3.91299963
                }
            },            {
                index: 6,
                usableDistance: 0.699999988,
                position: {
                    x: 14.0770006,
                    y: 16.4849987
                }
            }
        ]
    },
    1: {
        index: 1,
        hudText: "Meeting Room: Enter Id Code",
        taskType: TaskType.EnterIdCode,
        length: TaskLength.Common,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 16.2014275,
                    y: 16.3309994
                }
            }
        ]
    },
    2: {
        index: 2,
        hudText: "Electrical: Calibrate Distributor",
        taskType: TaskType.CalibrateDistributor,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 16.346632,
                    y: -5.49989939
                }
            }
        ]
    },
    3: {
        index: 3,
        hudText: "Electrical: Reset Breakers ({0}/7)",
        taskType: TaskType.ResetBreakers,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.2900009,
                    y: -10.1534996
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 20.267416,
                    y: -10.1534996
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 18.4239998,
                    y: -7.73850012
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 17.2900009,
                    y: -7.73850012
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 12.3340006,
                    y: -7.73850012
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 18.4169998,
                    y: -5.3375001
                }
            },            {
                index: 6,
                usableDistance: 1,
                position: {
                    x: 15.3650007,
                    y: -7.73850012
                }
            }
        ]
    },
    4: {
        index: 4,
        hudText: "Vault: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    5: {
        index: 5,
        hudText: "Brig: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    6: {
        index: 6,
        hudText: "Cargo Bay: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    7: {
        index: 7,
        hudText: "Gap Room: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    8: {
        index: 8,
        hudText: "Records: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    9: {
        index: 9,
        hudText: "Cargo Bay: Unlock Safe",
        taskType: TaskType.UnlockSafe,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 36.3019981,
                    y: -2.68799996
                }
            }
        ]
    },
    10: {
        index: 10,
        hudText: "Ventilation: Start Fans",
        taskType: TaskType.StartFans,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    11: {
        index: 11,
        hudText: "Main Hall: Empty Garbage ({0}/2)",
        taskType: TaskType.EmptyGarbage,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    12: {
        index: 12,
        hudText: "Medical: Empty Garbage ({0}/2)",
        taskType: TaskType.EmptyGarbage,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    13: {
        index: 13,
        hudText: "Kitchen: Empty Garbage ({0}/2)",
        taskType: TaskType.EmptyGarbage,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    14: {
        index: 14,
        hudText: "Main Hall: Develop Photos",
        taskType: TaskType.DevelopPhotos,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 13.527709,
                    y: 2.34949136
                }
            }
        ]
    },
    15: {
        index: 15,
        hudText: "Cargo Bay: Fuel Engines",
        taskType: TaskType.FuelEngines,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    16: {
        index: 16,
        hudText: "Security: Rewind Tapes",
        taskType: TaskType.RewindTapes,
        length: TaskLength.Short,
        consoles: [
            {
                index: 0,
                usableDistance: 1.39999998,
                position: {
                    x: 8.13049984,
                    y: -11.5352983
                }
            }
        ]
    },
    17: {
        index: 17,
        hudText: "Lounge: Empty Garbage ({0}/2)",
        taskType: TaskType.EmptyGarbage,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    18: {
        index: 18,
        hudText: "Showers: Empty Garbage ({0}/2)",
        taskType: TaskType.EmptyGarbage,
        length: TaskLength.Short,
        consoles: [

        ]
    },
    19: {
        index: 19,
        hudText: "Vault: Polish Ruby",
        taskType: TaskType.PolishRuby,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -8.8514986,
                    y: 9.09999943
                }
            }
        ]
    },
    20: {
        index: 20,
        hudText: "Cockpit: Stabilize Steering",
        taskType: TaskType.StabilizeSteering,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -19.6769981,
                    y: -0.791000009
                }
            }
        ]
    },
    21: {
        index: 21,
        hudText: "Armory: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    22: {
        index: 22,
        hudText: "Cockpit: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    23: {
        index: 23,
        hudText: "Communications: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    24: {
        index: 24,
        hudText: "Medical: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    25: {
        index: 25,
        hudText: "Viewing Deck: Download Data ({0}/2) ",
        taskType: TaskType.UploadData,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -14.4640999,
                    y: -16.387701
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 10.4685001,
                    y: -16.218298
                }
            }
        ]
    },
    26: {
        index: 26,
        hudText: "Electrical: Divert Power to Armory ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.5952892,
                    y: -3.71420002
                }
            }
        ]
    },
    27: {
        index: 27,
        hudText: "Electrical: Divert Power to Cockpit ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.5952892,
                    y: -3.71420002
                }
            }
        ]
    },
    28: {
        index: 28,
        hudText: "Electrical: Divert Power to Gap Room ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.5952892,
                    y: -3.71420002
                }
            }
        ]
    },
    29: {
        index: 29,
        hudText: "Electrical: Divert Power to Main Hall ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.5952892,
                    y: -3.71420002
                }
            }
        ]
    },
    30: {
        index: 30,
        hudText: "Electrical: Divert Power to Meeting Room ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.5952892,
                    y: -3.71420002
                }
            }
        ]
    },
    31: {
        index: 31,
        hudText: "Electrical: Divert Power to Showers ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.5952892,
                    y: -3.71420002
                }
            }
        ]
    },
    32: {
        index: 32,
        hudText: "Electrical: Divert Power to Engine Room ({0}/2)",
        taskType: TaskType.DivertPower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.5952892,
                    y: -3.71420002
                }
            }
        ]
    },
    33: {
        index: 33,
        hudText: "Showers: Pick Up Towels ({0}/8)",
        taskType: TaskType.PickUpTowels,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 17.3159008,
                    y: 4.74695349
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 20.3819008,
                    y: 4.57099962
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 21.8169003,
                    y: 2.46399999
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 18.8489017,
                    y: -0.909999967
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 24.0359001,
                    y: -2.18399978
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 20.5499001,
                    y: -1.73599994
                }
            },            {
                index: 6,
                usableDistance: 1,
                position: {
                    x: 22.0128994,
                    y: -1.42799997
                }
            },            {
                index: 7,
                usableDistance: 1,
                position: {
                    x: 20.0809002,
                    y: -0.0419999585
                }
            },            {
                index: 8,
                usableDistance: 1,
                position: {
                    x: 19.1849003,
                    y: 3.36699986
                }
            },            {
                index: 9,
                usableDistance: 1,
                position: {
                    x: 22.9648991,
                    y: 0.0559999458
                }
            },            {
                index: 10,
                usableDistance: 1,
                position: {
                    x: 18.134901,
                    y: 2.07200003
                }
            },            {
                index: 11,
                usableDistance: 1,
                position: {
                    x: 23.0418987,
                    y: -1.49100006
                }
            },            {
                index: 12,
                usableDistance: 1,
                position: {
                    x: 22.9173012,
                    y: -1.35240006
                }
            },            {
                index: 13,
                usableDistance: 1,
                position: {
                    x: 23.1231003,
                    y: -1.39999998
                }
            },            {
                index: 255,
                usableDistance: 1,
                position: {
                    x: 18.7929001,
                    y: 5.13800001
                }
            }
        ]
    },
    34: {
        index: 34,
        hudText: "Lounge: Clean Toilet",
        taskType: TaskType.CleanToilet,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 29.191824,
                    y: 7.73951101
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 30.8083954,
                    y: 7.72099972
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 32.320076,
                    y: 7.76419115
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 33.7358627,
                    y: 7.79169893
                }
            }
        ]
    },
    35: {
        index: 35,
        hudText: "Vault: Dress Mannequin",
        taskType: TaskType.DressMannequin,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -7.38429832,
                    y: 6.43019962
                }
            }
        ]
    },
    36: {
        index: 36,
        hudText: "Records: Sort Records ({0}/4)",
        taskType: TaskType.SortRecords,
        length: TaskLength.Long,
        consoles: [
            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 17.9353981,
                    y: 11.4015999
                }
            },            {
                index: 6,
                usableDistance: 1,
                position: {
                    x: 21.8547001,
                    y: 11.4162998
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 19.8938465,
                    y: 9.27367783
                }
            },            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: 18.6878967,
                    y: 12.503397
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: 19.2549,
                    y: 12.7014999
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 20.5196018,
                    y: 12.7189989
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: 21.1070976,
                    y: 12.5278969
                }
            },            {
                index: 7,
                usableDistance: 1,
                position: {
                    x: 21.5991993,
                    y: 7.07000017
                }
            },            {
                index: 8,
                usableDistance: 1,
                position: {
                    x: 18.1866989,
                    y: 7.06510019
                }
            }
        ]
    },
    37: {
        index: 37,
        hudText: "Armory: Put Away Pistols",
        taskType: TaskType.PutAwayPistols,
        length: TaskLength.Long,
        consoles: [

        ]
    },
    38: {
        index: 38,
        hudText: "Armory: Put Away Rifles",
        taskType: TaskType.PutAwayRifles,
        length: TaskLength.Long,
        consoles: [

        ]
    },
    39: {
        index: 39,
        hudText: "Main Hall: Decontaminate",
        taskType: TaskType.Decontaminate,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 14.7915564,
                    y: 3.70299983
                }
            },            {
                index: 0,
                usableDistance: 0.800000012,
                position: {
                    x: 14.7915564,
                    y: 3.70299983
                }
            }
        ]
    },
    40: {
        index: 40,
        hudText: "Kitchen: Make Burger",
        taskType: TaskType.MakeBurger,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -5.17929983,
                    y: -8.52390003
                }
            }
        ]
    },
    41: {
        index: 41,
        hudText: "Showers: Fix Shower",
        taskType: TaskType.FixShower,
        length: TaskLength.Long,
        consoles: [
            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: 20.8159008,
                    y: 3.27599978
                }
            }
        ]
    },
    42: {
        index: 42,
        hudText: "Viewing Deck: Clean Vent",
        taskType: TaskType.ViewingDeck,
        length: TaskLength.Long,
        consoles: [
            {
                index: 1,
                usableDistance: 1,
                position: {
                    x: -22.098999,
                    y: -1.51200008
                }
            },            {
                index: 3,
                usableDistance: 1,
                position: {
                    x: 0.202999964,
                    y: -2.53610039
                }
            },            {
                index: 0,
                usableDistance: 1,
                position: {
                    x: -12.6321983,
                    y: 8.47350025
                }
            },            {
                index: 4,
                usableDistance: 1,
                position: {
                    x: -2.60189986,
                    y: -9.3380003
                }
            },            {
                index: 2,
                usableDistance: 1,
                position: {
                    x: -15.6589994,
                    y: -11.6991005
                }
            },            {
                index: 8,
                usableDistance: 1,
                position: {
                    x: 3.60499978,
                    y: 6.92300034
                }
            },            {
                index: 7,
                usableDistance: 1,
                position: {
                    x: 12.6630001,
                    y: 5.92199993
                }
            },            {
                index: 5,
                usableDistance: 1,
                position: {
                    x: 7.02100039,
                    y: -3.73099947
                }
            },            {
                index: 6,
                usableDistance: 1,
                position: {
                    x: 9.81400013,
                    y: 3.20600033
                }
            },            {
                index: 9,
                usableDistance: 1,
                position: {
                    x: 23.9869003,
                    y: -1.38600004
                }
            },            {
                index: 10,
                usableDistance: 1,
                position: {
                    x: 23.2798977,
                    y: 8.25999832
                }
            },            {
                index: 11,
                usableDistance: 1,
                position: {
                    x: 30.440897,
                    y: -3.57700014
                }
            }
        ]
    }
};
