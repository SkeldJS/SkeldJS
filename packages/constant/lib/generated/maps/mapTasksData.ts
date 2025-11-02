import { GameMap } from "../../enums";
import { SystemType } from "../SystemType";
import { TaskType } from "../TaskType";

export type TaskConsoleData = {
    id: number;
    associatedZone: SystemType;
    position: { x: number; y: number; };
    usableDistance: number;
};

export type TaskData = {
    type: TaskType,
    length: "Common"|"Long"|"Short";
    consoles: TaskConsoleData[];
};

export const mapTasksData: Record<GameMap, TaskData[]> = {
    [GameMap.TheSkeld]: [
        {
            type: TaskType.SwipeCard,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 5.6352005, y: -8.632801 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWiring,
            length: "Common",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Admin,
                    position: { x: 1.392, y: -6.4092 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Cafeteria,
                    position: { x: -5.2811995, y: 5.2464 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Nav,
                    position: { x: 14.5199995, y: -3.7740002 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -7.7279997, y: -7.6668 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Storage,
                    position: { x: -1.932, y: -8.7204 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Security,
                    position: { x: -15.5592, y: -4.5923996 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ClearAsteroids,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Weapons,
                    position: { x: 9.087601, y: 1.812 },
                    usableDistance: 1.2,
                },
            ],
        },
        {
            type: TaskType.AlignEngineOutput,
            length: "Long",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.LowerEngine,
                    position: { x: -19.150799, y: -12.618 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.UpperEngine,
                    position: { x: -19.176, y: -0.41442212 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.SubmitScan,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MedBay,
                    position: { x: -7.3284, y: -5.2476006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.InspectSample,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MedBay,
                    position: { x: -6.144, y: -4.2599998 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FuelEngines,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.StartReactor,
            length: "Long",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Reactor,
                    position: { x: -21.792, y: -5.5728 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.EmptyChute,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.CalibrateDistributor,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -5.8644004, y: -7.4772 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ChartCourse,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.CleanO2Filter,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.LifeSupp,
                    position: { x: 5.7432, y: -2.9772 },
                    usableDistance: 0.8,
                },
            ],
        },
        {
            type: TaskType.UnlockManifolds,
            length: "Short",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Reactor,
                    position: { x: -22.536001, y: -2.4996 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.StabilizeSteering,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Nav,
                    position: { x: 18.732, y: -4.728 },
                    usableDistance: 1.25,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.PrimeShields,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Shields,
                    position: { x: 7.526399, y: -13.981199 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.VentCleaning,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 2.544, y: -9.955201 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Cafeteria,
                    position: { x: 4.2588, y: -0.27600002 },
                    usableDistance: 1,
                },
                {
                    id: 13,
                    associatedZone: SystemType.Nav,
                    position: { x: 16.008001, y: -6.3840003 },
                    usableDistance: 1,
                },
                {
                    id: 12,
                    associatedZone: SystemType.Nav,
                    position: { x: 16.008001, y: -3.1680002 },
                    usableDistance: 1,
                },
                {
                    id: 7,
                    associatedZone: SystemType.Weapons,
                    position: { x: 8.820001, y: 3.3240001 },
                    usableDistance: 1,
                },
                {
                    id: 10,
                    associatedZone: SystemType.Shields,
                    position: { x: 9.5232, y: -14.337601 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: 9.384, y: -6.438 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Electrical,
                    position: { x: -9.7764, y: -8.034 },
                    usableDistance: 1,
                },
                {
                    id: 8,
                    associatedZone: SystemType.Reactor,
                    position: { x: -20.796001, y: -6.9528003 },
                    usableDistance: 1,
                },
                {
                    id: 11,
                    associatedZone: SystemType.Reactor,
                    position: { x: -21.876, y: -3.0516002 },
                    usableDistance: 1,
                },
                {
                    id: 9,
                    associatedZone: SystemType.LowerEngine,
                    position: { x: -15.2508, y: -13.656001 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.UpperEngine,
                    position: { x: -15.288, y: 2.52 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Security,
                    position: { x: -12.534, y: -6.9492 },
                    usableDistance: 1,
                },
                {
                    id: 6,
                    associatedZone: SystemType.MedBay,
                    position: { x: -10.608001, y: -4.176 },
                    usableDistance: 1,
                },
            ],
        },
    ],
    [GameMap.MiraHQ]: [
        {
            type: TaskType.FixWiring,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Storage,
                    position: { x: 18.39, y: 1.2 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: 12.096, y: 8.04 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 6.125, y: 14.958 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.LockerRoom,
                    position: { x: 4.3559995, y: 2.5340002 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Greenhouse,
                    position: { x: 16.980001, y: 21.394 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.EnterIdCode,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 19.894001, y: 19.024 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.SubmitScan,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MedBay,
                    position: { x: 16.233, y: 0.262 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ClearAsteroids,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Weapons,
                    position: { x: 19.213, y: -2.414 },
                    usableDistance: 1.8,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.77700007, y: 11.484 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.77700007, y: 11.484 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.77700007, y: 11.484 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.77700007, y: 11.484 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.77700007, y: 11.484 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.77700007, y: 11.484 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.WaterPlants,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.StartReactor,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 2.549, y: 12.407001 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.77700007, y: 11.484 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ChartCourse,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.CleanO2Filter,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Greenhouse,
                    position: { x: 17.221, y: 24.505001 },
                    usableDistance: 2,
                },
            ],
        },
        {
            type: TaskType.FuelEngines,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.AssembleArtifact,
            length: "Short",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 9.402, y: 14.568001 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.SortSamples,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 9.660001, y: 11.115001 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.PrimeShields,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: 21.169, y: 17.945 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.MeasureWeather,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Balcony,
                    position: { x: 28.911999, y: -1.701 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.77700007, y: 11.484 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.BuyBeverage,
            length: "Short",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Cafeteria,
                    position: { x: 27.49, y: 5.665 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ProcessData,
            length: "Short",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Office,
                    position: { x: 15.776001, y: 21.403 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.RunDiagnostics,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Launchpad,
                    position: { x: -2.499, y: 1.8730001 },
                    usableDistance: 1.5,
                },
            ],
        },
        {
            type: TaskType.UnlockManifolds,
            length: "Short",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.44200015, y: 13.2560005 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.VentCleaning,
            length: "Short",
            consoles: [
                {
                    id: 11,
                    associatedZone: SystemType.Launchpad,
                    position: { x: -6.1800003, y: 3.5600002 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Balcony,
                    position: { x: 23.769999, y: -1.9399999 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Hallway,
                    position: { x: 23.9, y: 7.1800003 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Reactor,
                    position: { x: 0.48000014, y: 10.6970005 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 11.606001, y: 13.816 },
                    usableDistance: 1,
                },
                {
                    id: 10,
                    associatedZone: SystemType.LockerRoom,
                    position: { x: 4.29, y: 0.52999973 },
                    usableDistance: 1,
                },
                {
                    id: 6,
                    associatedZone: SystemType.Admin,
                    position: { x: 22.390001, y: 17.23 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Office,
                    position: { x: 13.280001, y: 20.13 },
                    usableDistance: 1,
                },
                {
                    id: 7,
                    associatedZone: SystemType.Greenhouse,
                    position: { x: 17.85, y: 25.23 },
                    usableDistance: 1,
                },
                {
                    id: 8,
                    associatedZone: SystemType.MedBay,
                    position: { x: 15.41, y: -1.8199997 },
                    usableDistance: 1,
                },
                {
                    id: 9,
                    associatedZone: SystemType.Decontamination,
                    position: { x: 6.83, y: 3.145 },
                    usableDistance: 1,
                },
            ],
        },
    ],
    [GameMap.Polus]: [
        {
            type: TaskType.SwipeCard,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Office,
                    position: { x: 24.816444, y: -16.217522 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.InsertKeys,
            length: "Common",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Dropship,
                    position: { x: 17.38076, y: 0.08402014 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ScanBoardingPass,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Office,
                    position: { x: 25.75001, y: -16.03081 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWiring,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 3.0672798, y: -8.691476 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.LifeSupp,
                    position: { x: 6.499, y: -18.458 },
                    usableDistance: 0.77,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Office,
                    position: { x: 16.373749, y: -18.505589 },
                    usableDistance: 0.8,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Decontamination,
                    position: { x: 40.61, y: -8.96 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 37.321003, y: -8.944 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 32.975002, y: -9.031365 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Comms,
                    position: { x: 11.71978, y: -15.145192 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Comms,
                    position: { x: 11.71978, y: -15.145192 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Comms,
                    position: { x: 11.71978, y: -15.145192 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Comms,
                    position: { x: 11.71978, y: -15.145192 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Comms,
                    position: { x: 11.71978, y: -15.145192 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.StartReactor,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Specimens,
                    position: { x: 34.757774, y: -18.878536 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FuelEngines,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.OpenWaterways,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.BoilerRoom,
                    position: { x: 3.669, y: -24.15 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.BoilerRoom,
                    position: { x: 0.9430001, y: -24.15 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.BoilerRoom,
                    position: { x: 18.417002, y: -23.72 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.InspectSample,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 36.52848, y: -5.5693474 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ReplaceWaterJug,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.FixWeatherNode,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 23.04, y: -6.94 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: 8.37, y: -15.46 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Hallway,
                    position: { x: 7.16, y: -25.36 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.96, y: -25.44 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.48, y: -12.17 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Hallway,
                    position: { x: 30.86, y: -12.23 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWeatherNode,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 23.04, y: -6.94 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: 8.37, y: -15.46 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Hallway,
                    position: { x: 7.16, y: -25.36 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.96, y: -25.44 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.48, y: -12.17 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Hallway,
                    position: { x: 30.86, y: -12.23 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWeatherNode,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 23.04, y: -6.94 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: 8.37, y: -15.46 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Hallway,
                    position: { x: 7.16, y: -25.36 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.96, y: -25.44 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.48, y: -12.17 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Hallway,
                    position: { x: 30.86, y: -12.23 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWeatherNode,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 23.04, y: -6.94 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: 8.37, y: -15.46 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Hallway,
                    position: { x: 7.16, y: -25.36 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.96, y: -25.44 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.48, y: -12.17 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Hallway,
                    position: { x: 30.86, y: -12.23 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.RebootWifi,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Comms,
                    position: { x: 11.047999, y: -15.297912 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.MonitorOxygen,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 1.654, y: -16.012001 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UnlockManifolds,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Specimens,
                    position: { x: 34.381306, y: -19.486675 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.StoreArtifacts,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Specimens,
                    position: { x: 36.481117, y: -18.82867 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FillCanisters,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.LifeSupp,
                    position: { x: 1.1431961, y: -19.525873 },
                    usableDistance: 0.6,
                },
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.ChartCourse,
            length: "Short",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Dropship,
                    position: { x: 15.974811, y: 0.08402014 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.SubmitScan,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MedBay,
                    position: { x: 40.327003, y: -7.082 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ClearAsteroids,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Weapons,
                    position: { x: 9.929073, y: -22.390993 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWeatherNode,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 23.04, y: -6.94 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: 8.37, y: -15.46 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Hallway,
                    position: { x: 7.16, y: -25.36 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.96, y: -25.44 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.48, y: -12.17 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Hallway,
                    position: { x: 30.86, y: -12.23 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWeatherNode,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 23.04, y: -6.94 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: 8.37, y: -15.46 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Hallway,
                    position: { x: 7.16, y: -25.36 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.96, y: -25.44 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.48, y: -12.17 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Hallway,
                    position: { x: 30.86, y: -12.23 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.AlignTelescope,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 33.868427, y: -5.4712653 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.RepairDrill,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 27.42095, y: -6.982279 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.RecordTemperature,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 31.34464, y: -6.67142 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Outside,
                    position: { x: 30.93255, y: -15.324791 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.RecordTemperature,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Laboratory,
                    position: { x: 31.34464, y: -6.67142 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Outside,
                    position: { x: 30.93255, y: -15.324791 },
                    usableDistance: 1,
                },
            ],
        },
    ],
    [GameMap.AprilFoolsTheSkeld]: [
        {
            type: TaskType.SwipeCard,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: -5.6352005, y: -8.632801 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWiring,
            length: "Common",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Admin,
                    position: { x: -1.392, y: -6.4092 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Cafeteria,
                    position: { x: 5.2811995, y: 5.2464 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Nav,
                    position: { x: -14.5199995, y: -3.7740002 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 7.7279997, y: -7.6668 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Storage,
                    position: { x: 1.932, y: -8.7204 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Security,
                    position: { x: 15.5592, y: -4.5923996 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ClearAsteroids,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Weapons,
                    position: { x: -9.087601, y: 1.812 },
                    usableDistance: 1.2,
                },
            ],
        },
        {
            type: TaskType.AlignEngineOutput,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.LowerEngine,
                    position: { x: 19.150799, y: -12.618 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.UpperEngine,
                    position: { x: 19.176, y: -0.41442212 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.SubmitScan,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MedBay,
                    position: { x: 7.3284, y: -5.2476006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.InspectSample,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MedBay,
                    position: { x: 6.144, y: -4.2599998 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FuelEngines,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.StartReactor,
            length: "Long",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Reactor,
                    position: { x: 21.792, y: -5.5728 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.EmptyChute,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: -2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.CalibrateDistributor,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 5.8644004, y: -7.4772 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ChartCourse,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.CleanO2Filter,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.LifeSupp,
                    position: { x: -5.7432, y: -2.9772 },
                    usableDistance: 0.8,
                },
            ],
        },
        {
            type: TaskType.UnlockManifolds,
            length: "Short",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.Reactor,
                    position: { x: 22.536001, y: -2.4996 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: -2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.StabilizeSteering,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Nav,
                    position: { x: -18.732, y: -4.728 },
                    usableDistance: 1.25,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: -2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.PrimeShields,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Shields,
                    position: { x: -7.526399, y: -13.981199 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: -2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: -2.5079997, y: -6.2652006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9, y: -7.2936006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.VentCleaning,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Admin,
                    position: { x: -2.544, y: -9.955201 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Cafeteria,
                    position: { x: -4.2588, y: -0.27600002 },
                    usableDistance: 1,
                },
                {
                    id: 13,
                    associatedZone: SystemType.Nav,
                    position: { x: -16.008001, y: -6.3840003 },
                    usableDistance: 1,
                },
                {
                    id: 12,
                    associatedZone: SystemType.Nav,
                    position: { x: -16.008001, y: -3.1680002 },
                    usableDistance: 1,
                },
                {
                    id: 7,
                    associatedZone: SystemType.Weapons,
                    position: { x: -8.820001, y: 3.3240001 },
                    usableDistance: 1,
                },
                {
                    id: 10,
                    associatedZone: SystemType.Shields,
                    position: { x: -9.5232, y: -14.337601 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Hallway,
                    position: { x: -9.384, y: -6.438 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Electrical,
                    position: { x: 9.7764, y: -8.034 },
                    usableDistance: 1,
                },
                {
                    id: 8,
                    associatedZone: SystemType.Reactor,
                    position: { x: 20.796001, y: -6.9528003 },
                    usableDistance: 1,
                },
                {
                    id: 11,
                    associatedZone: SystemType.Reactor,
                    position: { x: 21.876, y: -3.0516002 },
                    usableDistance: 1,
                },
                {
                    id: 9,
                    associatedZone: SystemType.LowerEngine,
                    position: { x: 15.2508, y: -13.656001 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.UpperEngine,
                    position: { x: 15.288, y: 2.52 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Security,
                    position: { x: 12.534, y: -6.9492 },
                    usableDistance: 1,
                },
                {
                    id: 6,
                    associatedZone: SystemType.MedBay,
                    position: { x: 10.608001, y: -4.176 },
                    usableDistance: 1,
                },
            ],
        },
    ],
    [GameMap.Airship]: [
        {
            type: TaskType.FixWiring,
            length: "Common",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.Engine,
                    position: { x: -7.021, y: 1.4909999 },
                    usableDistance: 0.7,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -10.290699, y: -11.334398 },
                    usableDistance: 0.7,
                },
                {
                    id: 2,
                    associatedZone: SystemType.MainHall,
                    position: { x: 16.212, y: 2.8630004 },
                    usableDistance: 0.7,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Showers,
                    position: { x: 17.0821, y: 5.481 },
                    usableDistance: 0.7,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Lounge,
                    position: { x: 27.3574, y: 10.388 },
                    usableDistance: 0.7,
                },
                {
                    id: 5,
                    associatedZone: SystemType.CargoBay,
                    position: { x: 35.154, y: 3.9129996 },
                    usableDistance: 0.7,
                },
                {
                    id: 6,
                    associatedZone: SystemType.MeetingRoom,
                    position: { x: 14.077001, y: 16.484999 },
                    usableDistance: 0.7,
                },
            ],
        },
        {
            type: TaskType.EnterIdCode,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Cockpit,
                    position: { x: 16.201427, y: 16.331 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.CalibrateDistributor,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 16.346632, y: -5.4998994 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ResetBreakers,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.29, y: -10.1535 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Electrical,
                    position: { x: 20.267416, y: -10.1535 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Electrical,
                    position: { x: 18.424, y: -7.7385 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.29, y: -7.7385 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Electrical,
                    position: { x: 12.334001, y: -7.7385 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Electrical,
                    position: { x: 18.417, y: -5.3375 },
                    usableDistance: 1,
                },
                {
                    id: 6,
                    associatedZone: SystemType.Electrical,
                    position: { x: 15.365001, y: -7.7385 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UnlockSafe,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.CargoBay,
                    position: { x: 36.302, y: -2.688 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.StartFans,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.DevelopPhotos,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MainHall,
                    position: { x: 13.527709, y: 2.3494914 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FuelEngines,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.RewindTapes,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Security,
                    position: { x: 8.1305, y: -11.535298 },
                    usableDistance: 1.4,
                },
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.PolishRuby,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.VaultRoom,
                    position: { x: -8.851499, y: 9.099999 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.StabilizeSteering,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Cockpit,
                    position: { x: -19.676998, y: -0.791 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.UploadData,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -14.4641, y: -16.387701 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: 10.4685, y: -16.218298 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.59529, y: -3.7142 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.59529, y: -3.7142 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.59529, y: -3.7142 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.59529, y: -3.7142 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.59529, y: -3.7142 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.59529, y: -3.7142 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DivertPower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Electrical,
                    position: { x: 17.59529, y: -3.7142 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.PickUpTowels,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Showers,
                    position: { x: 17.3159, y: 4.7469535 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Showers,
                    position: { x: 20.3819, y: 4.5709996 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Showers,
                    position: { x: 21.8169, y: 2.464 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Showers,
                    position: { x: 18.848902, y: -0.90999997 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Showers,
                    position: { x: 24.0359, y: -2.1839998 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.Showers,
                    position: { x: 20.5499, y: -1.736 },
                    usableDistance: 1,
                },
                {
                    id: 6,
                    associatedZone: SystemType.Showers,
                    position: { x: 22.0129, y: -1.428 },
                    usableDistance: 1,
                },
                {
                    id: 7,
                    associatedZone: SystemType.Showers,
                    position: { x: 20.0809, y: -0.04199996 },
                    usableDistance: 1,
                },
                {
                    id: 8,
                    associatedZone: SystemType.Showers,
                    position: { x: 19.1849, y: 3.3669999 },
                    usableDistance: 1,
                },
                {
                    id: 9,
                    associatedZone: SystemType.Showers,
                    position: { x: 22.9649, y: 0.055999946 },
                    usableDistance: 1,
                },
                {
                    id: 10,
                    associatedZone: SystemType.Showers,
                    position: { x: 18.134901, y: 2.072 },
                    usableDistance: 1,
                },
                {
                    id: 11,
                    associatedZone: SystemType.Showers,
                    position: { x: 23.041899, y: -1.491 },
                    usableDistance: 1,
                },
                {
                    id: 12,
                    associatedZone: SystemType.Showers,
                    position: { x: 22.917301, y: -1.3524001 },
                    usableDistance: 1,
                },
                {
                    id: 13,
                    associatedZone: SystemType.Showers,
                    position: { x: 23.1231, y: -1.4 },
                    usableDistance: 1,
                },
                {
                    id: 255,
                    associatedZone: SystemType.Showers,
                    position: { x: 18.7929, y: 5.138 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.CleanToilet,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Lounge,
                    position: { x: 29.191824, y: 7.739511 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Lounge,
                    position: { x: 30.808395, y: 7.7209997 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Lounge,
                    position: { x: 32.320076, y: 7.764191 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Lounge,
                    position: { x: 33.735863, y: 7.791699 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.DressMannequin,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.VaultRoom,
                    position: { x: -7.3842983, y: 6.4301996 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.SortRecords,
            length: "Short",
            consoles: [
                {
                    id: 5,
                    associatedZone: SystemType.Records,
                    position: { x: 17.935398, y: 11.4016 },
                    usableDistance: 1,
                },
                {
                    id: 6,
                    associatedZone: SystemType.Records,
                    position: { x: 21.8547, y: 11.4163 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Records,
                    position: { x: 19.893847, y: 9.273678 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Records,
                    position: { x: 18.687897, y: 12.503397 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Records,
                    position: { x: 19.2549, y: 12.7015 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Records,
                    position: { x: 20.519602, y: 12.718999 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Records,
                    position: { x: 21.107098, y: 12.527897 },
                    usableDistance: 1,
                },
                {
                    id: 7,
                    associatedZone: SystemType.Records,
                    position: { x: 21.5992, y: 7.07 },
                    usableDistance: 1,
                },
                {
                    id: 8,
                    associatedZone: SystemType.Records,
                    position: { x: 18.186699, y: 7.0651 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.PutAwayPistols,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.PutAwayRifles,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.Decontaminate,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MainHall,
                    position: { x: 14.791556, y: 3.7029998 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Hallway,
                    position: { x: 14.791556, y: 3.7029998 },
                    usableDistance: 0.8,
                },
            ],
        },
        {
            type: TaskType.MakeBurger,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Kitchen,
                    position: { x: -5.1793, y: -8.5239 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixShower,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Showers,
                    position: { x: 20.8159, y: 3.2759998 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.VentCleaning,
            length: "Short",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.Cockpit,
                    position: { x: -22.098999, y: -1.5120001 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Engine,
                    position: { x: 0.20299996, y: -2.5361004 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.VaultRoom,
                    position: { x: -12.632198, y: 8.4735 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Kitchen,
                    position: { x: -2.6018999, y: -9.338 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.ViewingDeck,
                    position: { x: -15.658999, y: -11.6991005 },
                    usableDistance: 1,
                },
                {
                    id: 8,
                    associatedZone: SystemType.GapRoom,
                    position: { x: 3.6049998, y: 6.9230003 },
                    usableDistance: 1,
                },
                {
                    id: 7,
                    associatedZone: SystemType.GapRoom,
                    position: { x: 12.663, y: 5.922 },
                    usableDistance: 1,
                },
                {
                    id: 5,
                    associatedZone: SystemType.MainHall,
                    position: { x: 7.0210004, y: -3.7309995 },
                    usableDistance: 1,
                },
                {
                    id: 6,
                    associatedZone: SystemType.MainHall,
                    position: { x: 9.814, y: 3.2060003 },
                    usableDistance: 1,
                },
                {
                    id: 9,
                    associatedZone: SystemType.Showers,
                    position: { x: 23.9869, y: -1.386 },
                    usableDistance: 1,
                },
                {
                    id: 10,
                    associatedZone: SystemType.Records,
                    position: { x: 23.279898, y: 8.259998 },
                    usableDistance: 1,
                },
                {
                    id: 11,
                    associatedZone: SystemType.CargoBay,
                    position: { x: 30.440897, y: -3.5770001 },
                    usableDistance: 1,
                },
            ],
        },
    ],
    [GameMap.Fungle]: [
        {
            type: TaskType.CollectSamples,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Laboratory,
                    position: { x: -6.373, y: -8.884999 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.EnterIdCode,
            length: "Common",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.Lookout,
                    position: { x: 8.446, y: 5.27 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ReplaceParts,
            length: "Common",
            consoles: [
            ],
        },
        {
            type: TaskType.RoastMarshmallow,
            length: "Common",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Beach,
                    position: { x: -9.788, y: 1.641 },
                    usableDistance: 1.35,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Beach,
                    position: { x: -18.372, y: -3.849 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Beach,
                    position: { x: -20.07, y: 3.303 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Beach,
                    position: { x: -11.333, y: 7.898 },
                    usableDistance: 1,
                },
                {
                    id: 4,
                    associatedZone: SystemType.Beach,
                    position: { x: -9.309, y: -3.507 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.CatchFish,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.FishingDock,
                    position: { x: -24.359001, y: -6.8320003 },
                    usableDistance: 1.28,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Kitchen,
                    position: { x: -12.645, y: -9.364001 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.CollectVegetables,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.ExtractFuel,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.HelpCritter,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.HoistSupplies,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.PolishGem,
            length: "Long",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.MiningPit,
                    position: { x: 14.353, y: 10.241 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.MineOres,
            length: "Long",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.MiningPit,
                    position: { x: 11.076, y: 10.651 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.ReplaceWaterJug,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.WaterPlants,
            length: "Long",
            consoles: [
            ],
        },
        {
            type: TaskType.AssembleArtifact,
            length: "Short",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.Laboratory,
                    position: { x: -6.2650003, y: -9.592999 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.BuildSandcastle,
            length: "Short",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.RecRoom,
                    position: { x: -21.474998, y: 0.36600006 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.CollectShells,
            length: "Short",
            consoles: [
                {
                    id: 2,
                    associatedZone: SystemType.RecRoom,
                    position: { x: -20.28, y: -2.4299998 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Beach,
                    position: { x: 3.16, y: 1.51 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Beach,
                    position: { x: -7.95, y: -1.9399999 },
                    usableDistance: 1,
                },
                {
                    id: 3,
                    associatedZone: SystemType.Beach,
                    position: { x: -3.178, y: 8.14 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.CrankGenerator,
            length: "Short",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.Comms,
                    position: { x: 20.751, y: 14.603 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Kitchen,
                    position: { x: -12.999001, y: -6.3429995 },
                    usableDistance: 1.25,
                },
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.EmptyGarbage,
            length: "Short",
            consoles: [
            ],
        },
        {
            type: TaskType.FixAntenna,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Comms,
                    position: { x: 23.389, y: 14.826 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.FixWiring,
            length: "Short",
            consoles: [
                {
                    id: 4,
                    associatedZone: SystemType.Comms,
                    position: { x: 19.373001, y: 14.288 },
                    usableDistance: 1,
                },
                {
                    id: 2,
                    associatedZone: SystemType.Dropship,
                    position: { x: -11.108, y: 13.398 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.LiftWeights,
            length: "Short",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.RecRoom,
                    position: { x: -19.151, y: 0.88100004 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.MonitorMushroom,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Jungle,
                    position: { x: 12.791, y: -15.567999 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.PlayVideogame,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.SleepingQuarters,
                    position: { x: 3.251, y: -1.0879999 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.RecordTemperature,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Greenhouse,
                    position: { x: 8.677, y: -11.279 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Laboratory,
                    position: { x: -2.8840003, y: -7.8939996 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 23.401001, y: -6.928 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.RecordTemperature,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Greenhouse,
                    position: { x: 8.677, y: -11.279 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Laboratory,
                    position: { x: -2.8840003, y: -7.8939996 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 23.401001, y: -6.928 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.RecordTemperature,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Greenhouse,
                    position: { x: 8.677, y: -11.279 },
                    usableDistance: 1,
                },
                {
                    id: 1,
                    associatedZone: SystemType.Laboratory,
                    position: { x: -2.8840003, y: -7.8939996 },
                    usableDistance: 1,
                },
                {
                    id: 0,
                    associatedZone: SystemType.Reactor,
                    position: { x: 23.401001, y: -6.928 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.TestFrisbee,
            length: "Short",
            consoles: [
                {
                    id: 1,
                    associatedZone: SystemType.RecRoom,
                    position: { x: -18.647, y: -0.88699996 },
                    usableDistance: 1,
                },
            ],
        },
        {
            type: TaskType.TuneRadio,
            length: "Short",
            consoles: [
                {
                    id: 0,
                    associatedZone: SystemType.Comms,
                    position: { x: 19.62, y: 12.764 },
                    usableDistance: 1,
                },
            ],
        },
    ],
};