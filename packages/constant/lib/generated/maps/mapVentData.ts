import { GameMap } from "../../enums";

export type VentData = {
    name: string;
    position: { x: number; y: number; };
    movements: {
        left: number|null;
        center: number|null;
        right: number|null;
    };
};

export const mapVentsData: Record<GameMap, (VentData|null)[]> = {
    [GameMap.TheSkeld]: [
        {
            name: "AdminVent",
            position: { x: 2.544, y: -9.955201 },
            movements: {
                left: 2,
                center: null,
                right: 1,
            }
        },
        {
            name: "BigYVent",
            position: { x: 9.384, y: -6.438 },
            movements: {
                left: 0,
                center: null,
                right: 2,
            }
        },
        {
            name: "CafeVent",
            position: { x: 4.2588, y: -0.27600002 },
            movements: {
                left: 0,
                center: null,
                right: 1,
            }
        },
        {
            name: "ElecVent",
            position: { x: -9.7764, y: -8.034 },
            movements: {
                left: 5,
                center: null,
                right: 6,
            }
        },
        {
            name: "LEngineVent",
            position: { x: -15.288, y: 2.52 },
            movements: {
                left: 11,
                center: null,
                right: null,
            }
        },
        {
            name: "SecurityVent",
            position: { x: -12.534, y: -6.9492 },
            movements: {
                left: 6,
                center: null,
                right: 3,
            }
        },
        {
            name: "MedVent",
            position: { x: -10.608001, y: -4.176 },
            movements: {
                left: 3,
                center: null,
                right: 5,
            }
        },
        {
            name: "WeaponsVent",
            position: { x: 8.820001, y: 3.3240001 },
            movements: {
                left: null,
                center: null,
                right: 12,
            }
        },
        {
            name: "ReactorVent",
            position: { x: -20.796001, y: -6.9528003 },
            movements: {
                left: null,
                center: null,
                right: 9,
            }
        },
        {
            name: "REngineVent",
            position: { x: -15.2508, y: -13.656001 },
            movements: {
                left: 8,
                center: null,
                right: null,
            }
        },
        {
            name: "ShieldsVent",
            position: { x: 9.5232, y: -14.337601 },
            movements: {
                left: null,
                center: null,
                right: 13,
            }
        },
        {
            name: "UpperReactorVent",
            position: { x: -21.876, y: -3.0516002 },
            movements: {
                left: null,
                center: null,
                right: 4,
            }
        },
        {
            name: "NavVentNorth",
            position: { x: 16.008001, y: -3.1680002 },
            movements: {
                left: 7,
                center: null,
                right: null,
            }
        },
        {
            name: "NavVentSouth",
            position: { x: 16.008001, y: -6.3840003 },
            movements: {
                left: 10,
                center: null,
                right: null,
            }
        },
    ],
    [GameMap.MiraHQ]: [
        null,
        {
            name: "BalconyVent",
            position: { x: 23.769999, y: -1.9399999 },
            movements: {
                left: 8,
                center: null,
                right: 2,
            }
        },
        {
            name: "YHallRightVent",
            position: { x: 23.9, y: 7.1800003 },
            movements: {
                left: 6,
                center: null,
                right: 1,
            }
        },
        {
            name: "ReactorVent",
            position: { x: 0.48000014, y: 10.6970005 },
            movements: {
                left: 4,
                center: 9,
                right: 11,
            }
        },
        {
            name: "LabVent",
            position: { x: 11.606001, y: 13.816 },
            movements: {
                left: 3,
                center: 9,
                right: 5,
            }
        },
        {
            name: "OfficeVent",
            position: { x: 13.280001, y: 20.13 },
            movements: {
                left: 4,
                center: 6,
                right: 7,
            }
        },
        {
            name: "AdminVent",
            position: { x: 22.390001, y: 17.23 },
            movements: {
                left: 7,
                center: 2,
                right: 5,
            }
        },
        {
            name: "AgriVent",
            position: { x: 17.85, y: 25.23 },
            movements: {
                left: 6,
                center: null,
                right: 5,
            }
        },
        {
            name: "MedVent",
            position: { x: 15.41, y: -1.8199997 },
            movements: {
                left: 1,
                center: null,
                right: 10,
            }
        },
        {
            name: "DeconVent",
            position: { x: 6.83, y: 3.145 },
            movements: {
                left: 3,
                center: 10,
                right: 4,
            }
        },
        {
            name: "LockerVent",
            position: { x: 4.29, y: 0.52999973 },
            movements: {
                left: 8,
                center: 11,
                right: 9,
            }
        },
        {
            name: "LaunchVent",
            position: { x: -6.1800003, y: 3.5600002 },
            movements: {
                left: 3,
                center: null,
                right: 10,
            }
        },
    ],
    [GameMap.Polus]: [
        {
            name: "ElectricalVent",
            position: { x: 1.9289999, y: -9.558001 },
            movements: {
                left: 2,
                center: null,
                right: 1,
            }
        },
        {
            name: "ElecFenceVent",
            position: { x: 6.9, y: -14.41 },
            movements: {
                left: 2,
                center: null,
                right: 0,
            }
        },
        {
            name: "LifeSuppVent",
            position: { x: 3.51, y: -16.58 },
            movements: {
                left: 1,
                center: null,
                right: 0,
            }
        },
        {
            name: "CommsVent",
            position: { x: 12.304, y: -18.897999 },
            movements: {
                left: 8,
                center: null,
                right: 4,
            }
        },
        {
            name: "OfficeVent",
            position: { x: 16.379, y: -19.599 },
            movements: {
                left: 3,
                center: null,
                right: 8,
            }
        },
        {
            name: "AdminVent",
            position: { x: 20.089003, y: -25.517 },
            movements: {
                left: 11,
                center: null,
                right: 7,
            }
        },
        {
            name: "BathroomVent",
            position: { x: 32.963, y: -9.526 },
            movements: {
                left: null,
                center: null,
                right: 7,
            }
        },
        {
            name: "SubBathroomVent",
            position: { x: 30.907003, y: -11.860001 },
            movements: {
                left: 6,
                center: null,
                right: 5,
            }
        },
        {
            name: "StorageVent",
            position: { x: 22, y: -12.190001 },
            movements: {
                left: 3,
                center: null,
                right: 4,
            }
        },
        {
            name: "ScienceBuildingVent",
            position: { x: 23.72, y: -7.82 },
            movements: {
                left: 10,
                center: null,
                right: null,
            }
        },
        {
            name: "ElectricBuildingVent",
            position: { x: 9.64, y: -7.72 },
            movements: {
                left: 9,
                center: null,
                right: null,
            }
        },
        {
            name: "SouthVent",
            position: { x: 18.93, y: -24.85 },
            movements: {
                left: null,
                center: null,
                right: 5,
            }
        },
    ],
    [GameMap.AprilFoolsTheSkeld]: [
        {
            name: "AdminVent (1)",
            position: { x: -2.544, y: -9.955201 },
            movements: {
                left: 2,
                center: null,
                right: 1,
            }
        },
        {
            name: "BigYVent (1)",
            position: { x: -9.384, y: -6.438 },
            movements: {
                left: 0,
                center: null,
                right: 2,
            }
        },
        {
            name: "CafeVent (1)",
            position: { x: -4.2588, y: -0.27600002 },
            movements: {
                left: 0,
                center: null,
                right: 1,
            }
        },
        {
            name: "ElecVent (1)",
            position: { x: 9.7764, y: -8.034 },
            movements: {
                left: 5,
                center: null,
                right: 6,
            }
        },
        {
            name: "LEngineVent (1)",
            position: { x: 15.288, y: 2.52 },
            movements: {
                left: 11,
                center: null,
                right: null,
            }
        },
        {
            name: "SecurityVent",
            position: { x: 12.534, y: -6.9492 },
            movements: {
                left: 6,
                center: null,
                right: 3,
            }
        },
        {
            name: "MedVent (1)",
            position: { x: 10.608001, y: -4.176 },
            movements: {
                left: 5,
                center: null,
                right: 3,
            }
        },
        {
            name: "WeaponsVent (1)",
            position: { x: -8.820001, y: 3.3240001 },
            movements: {
                left: null,
                center: null,
                right: 12,
            }
        },
        {
            name: "ReactorVent (1)",
            position: { x: 20.796001, y: -6.9528003 },
            movements: {
                left: 9,
                center: null,
                right: null,
            }
        },
        {
            name: "REngineVent (1)",
            position: { x: 15.2508, y: -13.656001 },
            movements: {
                left: 8,
                center: null,
                right: null,
            }
        },
        {
            name: "ShieldsVent (1)",
            position: { x: -9.5232, y: -14.337601 },
            movements: {
                left: 13,
                center: null,
                right: null,
            }
        },
        {
            name: "UpperReactorVent (1)",
            position: { x: 21.876, y: -3.0516002 },
            movements: {
                left: 4,
                center: null,
                right: null,
            }
        },
        {
            name: "NavVentNorth (1)",
            position: { x: -16.008001, y: -3.1680002 },
            movements: {
                left: null,
                center: null,
                right: 7,
            }
        },
        {
            name: "NavVentSouth (1)",
            position: { x: -16.008001, y: -6.3840003 },
            movements: {
                left: null,
                center: null,
                right: 10,
            }
        },
    ],
    [GameMap.Airship]: [
        {
            name: "VaultVent",
            position: { x: -12.632198, y: 8.4735 },
            movements: {
                left: 1,
                center: null,
                right: null,
            }
        },
        {
            name: "CockpitVent",
            position: { x: -22.098999, y: -1.5120001 },
            movements: {
                left: 0,
                center: null,
                right: 2,
            }
        },
        {
            name: "EjectionVent",
            position: { x: -15.658999, y: -11.6991005 },
            movements: {
                left: 1,
                center: null,
                right: null,
            }
        },
        {
            name: "EngineVent",
            position: { x: 0.20299996, y: -2.5361004 },
            movements: {
                left: 4,
                center: null,
                right: 5,
            }
        },
        {
            name: "KitchenVent",
            position: { x: -2.6018999, y: -9.338 },
            movements: {
                left: 3,
                center: null,
                right: 5,
            }
        },
        {
            name: "HallwayVent1",
            position: { x: 7.0210004, y: -3.7309995 },
            movements: {
                left: 3,
                center: null,
                right: 4,
            }
        },
        {
            name: "HallwayVent2",
            position: { x: 9.814, y: 3.2060003 },
            movements: {
                left: 8,
                center: null,
                right: 7,
            }
        },
        {
            name: "GaproomVent2",
            position: { x: 12.663, y: 5.922 },
            movements: {
                left: 8,
                center: null,
                right: 6,
            }
        },
        {
            name: "GaproomVent1",
            position: { x: 3.6049998, y: 6.9230003 },
            movements: {
                left: 7,
                center: null,
                right: 6,
            }
        },
        {
            name: "ShowersVent",
            position: { x: 23.9869, y: -1.386 },
            movements: {
                left: 10,
                center: null,
                right: 11,
            }
        },
        {
            name: "RecordsVent",
            position: { x: 23.279898, y: 8.259998 },
            movements: {
                left: 9,
                center: null,
                right: 11,
            }
        },
        {
            name: "StorageVent",
            position: { x: 30.440897, y: -3.5770001 },
            movements: {
                left: 9,
                center: null,
                right: 10,
            }
        },
    ],
    [GameMap.Fungle]: [
        {
            name: "CommunicationsVent",
            position: { x: 25.220001, y: 10.965 },
            movements: {
                left: 2,
                center: null,
                right: 5,
            }
        },
        {
            name: "KitchenVent",
            position: { x: -15.359, y: -9.783001 },
            movements: {
                left: 6,
                center: null,
                right: null,
            }
        },
        {
            name: "LookoutVent",
            position: { x: 9.366, y: 0.63 },
            movements: {
                left: 0,
                center: null,
                right: 5,
            }
        },
        {
            name: "StorageVent",
            position: { x: 2.864, y: 0.9180002 },
            movements: {
                left: 9,
                center: null,
                right: 4,
            }
        },
        {
            name: "NorthWestJungleVent",
            position: { x: -2.518, y: -8.986 },
            movements: {
                left: 8,
                center: null,
                right: 3,
            }
        },
        {
            name: "NorthEastJungleVent",
            position: { x: 22.677, y: -8.497 },
            movements: {
                left: 2,
                center: null,
                right: 0,
            }
        },
        {
            name: "SouthWestJungleVent",
            position: { x: 1.3000002, y: -10.515 },
            movements: {
                left: 1,
                center: null,
                right: 7,
            }
        },
        {
            name: "SouthEastJungleVent",
            position: { x: 15.150001, y: -16.42 },
            movements: {
                left: 6,
                center: null,
                right: null,
            }
        },
        {
            name: "RecRoomVent",
            position: { x: -16.9, y: -2.571 },
            movements: {
                left: 9,
                center: null,
                right: 4,
            }
        },
        {
            name: "MeetingRoomVent",
            position: { x: -12.233, y: 8.061 },
            movements: {
                left: 8,
                center: null,
                right: 3,
            }
        },
    ],
};