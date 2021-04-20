import {
    GameMap,
    TheSkeldVent,
    MiraHQVent,
    PolusVent,
    AirshipVent,
} from "@skeldjs/constant";
import { Vector2 } from "@skeldjs/util";

interface VentDataModel {
    id: number;
    position: Vector2;
    network: number[];
}

/** https://github.com/codyphobe/among-us-protocol/blob/master/07_miscellaneous/04_map_specific_ids_for_vents_and_tasks.md#the-skeld */
export const MapVentData: Record<GameMap, Record<number, VentDataModel>> = {
    [GameMap.TheSkeld]: {
        [TheSkeldVent.Admin]: {
            id: TheSkeldVent.Admin,
            position: {
                x: 2.543373,
                y: -9.59182,
            },
            network: [TheSkeldVent.RightHallway, TheSkeldVent.Cafeteria],
        },
        [TheSkeldVent.RightHallway]: {
            id: TheSkeldVent.RightHallway,
            position: {
                x: 9.38308,
                y: -6.0749207,
            },
            network: [TheSkeldVent.Admin, TheSkeldVent.Cafeteria],
        },
        [TheSkeldVent.Cafeteria]: {
            id: TheSkeldVent.Cafeteria,
            position: {
                x: 4.258915,
                y: 0.08728027,
            },
            network: [TheSkeldVent.Admin, TheSkeldVent.RightHallway],
        },
        [TheSkeldVent.Electrical]: {
            id: TheSkeldVent.Electrical,
            position: {
                x: -9.777372,
                y: -7.6704063,
            },
            network: [TheSkeldVent.Security, TheSkeldVent.MedBay],
        },
        [TheSkeldVent.UpperEngine]: {
            id: TheSkeldVent.UpperEngine,
            position: {
                x: -15.288929,
                y: 2.8827324,
            },
            network: [TheSkeldVent.UpperReactor],
        },
        [TheSkeldVent.Security]: {
            id: TheSkeldVent.Security,
            position: {
                x: -12.534981,
                y: -6.586403,
            },
            network: [TheSkeldVent.Electrical, TheSkeldVent.MedBay],
        },
        [TheSkeldVent.MedBay]: {
            id: TheSkeldVent.MedBay,
            position: {
                x: -10.608683,
                y: -3.8129234,
            },
            network: [TheSkeldVent.Electrical, TheSkeldVent.Security],
        },
        [TheSkeldVent.Weapons]: {
            id: TheSkeldVent.Weapons,
            position: {
                x: 8.819103,
                y: 3.687191,
            },
            network: [TheSkeldVent.UpperNavigation],
        },
        [TheSkeldVent.LowerReactor]: {
            id: TheSkeldVent.LowerReactor,
            position: {
                x: -20.796825,
                y: -6.590065,
            },
            network: [TheSkeldVent.LowerEngine],
        },
        [TheSkeldVent.LowerEngine]: {
            id: TheSkeldVent.LowerEngine,
            position: {
                x: -15.251087,
                y: -13.293049,
            },
            network: [TheSkeldVent.LowerReactor],
        },
        [TheSkeldVent.Shields]: {
            id: TheSkeldVent.Shields,
            position: {
                x: 9.52224,
                y: -13.974211,
            },
            network: [TheSkeldVent.LowerNavigation],
        },
        [TheSkeldVent.UpperReactor]: {
            id: TheSkeldVent.UpperReactor,
            position: {
                x: -21.877165,
                y: -2.6886406,
            },
            network: [TheSkeldVent.UpperEngine],
        },
        [TheSkeldVent.UpperNavigation]: {
            id: TheSkeldVent.UpperNavigation,
            position: {
                x: 16.007935,
                y: -2.8046074,
            },
            network: [TheSkeldVent.UpperNavigation],
        },
        [TheSkeldVent.LowerNavigation]: {
            id: TheSkeldVent.LowerNavigation,
            position: {
                x: 16.007935,
                y: -6.0212097,
            },
            network: [TheSkeldVent.Shields],
        },
    },
    [GameMap.MiraHQ]: {
        [MiraHQVent.Balcony]: {
            id: MiraHQVent.Balcony,
            position: {
                x: 23.769283,
                y: -1.576561,
            },
            network: [MiraHQVent.Cafeteria, MiraHQVent.MedBay],
        },
        [MiraHQVent.Cafeteria]: {
            id: MiraHQVent.Cafeteria,
            position: {
                x: 23.899899,
                y: 7.5434494,
            },
            network: [MiraHQVent.Balcony, MiraHQVent.Admin],
        },
        [MiraHQVent.Reactor]: {
            id: MiraHQVent.Reactor,
            position: {
                x: 0.4791336,
                y: 11.0603485,
            },
            network: [
                MiraHQVent.Laboratory,
                MiraHQVent.Decontamination,
                MiraHQVent.Launchpad,
            ],
        },
        [MiraHQVent.Laboratory]: {
            id: MiraHQVent.Laboratory,
            position: {
                x: 11.60479,
                y: 14.179291,
            },
            network: [MiraHQVent.Reactor, MiraHQVent.Office],
        },
        [MiraHQVent.Office]: {
            id: MiraHQVent.Office,
            position: {
                x: 13.279617,
                y: 20.492867,
            },
            network: [MiraHQVent.Laboratory, MiraHQVent.Greenhouse],
        },
        [MiraHQVent.Admin]: {
            id: MiraHQVent.Admin,
            position: {
                x: 22.38987,
                y: 17.59243,
            },
            network: [MiraHQVent.Greenhouse],
        },
        [MiraHQVent.Greenhouse]: {
            id: MiraHQVent.Greenhouse,
            position: {
                x: 17.848782,
                y: 25.59304,
            },
            network: [MiraHQVent.Office, MiraHQVent.Admin],
        },
        [MiraHQVent.MedBay]: {
            id: MiraHQVent.MedBay,
            position: {
                x: 15.409779,
                y: -1.4569321,
            },
            network: [MiraHQVent.Balcony, MiraHQVent.LockerRoom],
        },
        [MiraHQVent.Decontamination]: {
            id: MiraHQVent.Decontamination,
            position: {
                x: 6.8293304,
                y: 3.5077438,
            },
            network: [MiraHQVent.LockerRoom, MiraHQVent.Reactor],
        },
        [MiraHQVent.LockerRoom]: {
            id: MiraHQVent.LockerRoom,
            position: {
                x: 4.289009,
                y: 0.8929596,
            },
            network: [MiraHQVent.Decontamination, MiraHQVent.Launchpad],
        },
        [MiraHQVent.Launchpad]: {
            id: MiraHQVent.Launchpad,
            position: {
                x: -6.1811256,
                y: 3.9227905,
            },
            network: [MiraHQVent.Reactor],
        },
    },
    [GameMap.Polus]: {
        [PolusVent.Security]: {
            id: PolusVent.Security,
            position: {
                x: 1.9281311,
                y: -9.195087,
            },
            network: [PolusVent.O2, PolusVent.Electrical],
        },
        [PolusVent.Electrical]: {
            id: PolusVent.Electrical,
            position: {
                x: 6.8989105,
                y: -14.047455,
            },
            network: [PolusVent.Security, PolusVent.O2],
        },
        [PolusVent.O2]: {
            id: PolusVent.O2,
            position: {
                x: 3.5089645,
                y: -16.216679,
            },
            network: [PolusVent.Security, PolusVent.Electrical],
        },
        [PolusVent.Communications]: {
            id: PolusVent.Communications,
            position: {
                x: 12.303043,
                y: -18.53483,
            },
            network: [PolusVent.Office, PolusVent.Storage],
        },
        [PolusVent.Office]: {
            id: PolusVent.Office,
            position: {
                x: 16.377811,
                y: -19.235523,
            },
            network: [PolusVent.Communications, PolusVent.Storage],
        },
        [PolusVent.Admin]: {
            id: PolusVent.Admin,
            position: {
                x: 20.088806,
                y: -25.153582,
            },
            network: [PolusVent.LavaPool],
        },
        [PolusVent.Laboratory]: {
            id: PolusVent.Laboratory,
            position: {
                x: 32.96254,
                y: -9.163349,
            },
            network: [PolusVent.LavaPool],
        },
        [PolusVent.LavaPool]: {
            id: PolusVent.LavaPool,
            position: {
                x: 30.906845,
                y: -11.497368,
            },
            network: [PolusVent.Laboratory],
        },
        [PolusVent.Storage]: {
            id: PolusVent.Storage,
            position: {
                x: 21.999237,
                y: -11.826963,
            },
            network: [PolusVent.Communications, PolusVent.Office],
        },
        [PolusVent.RightSeismic]: {
            id: PolusVent.RightSeismic,
            position: {
                x: 24.019531,
                y: -8.026855,
            },
            network: [PolusVent.LeftSeismic],
        },
        [PolusVent.LeftSeismic]: {
            id: PolusVent.LeftSeismic,
            position: {
                x: 9.639431,
                y: -7.356678,
            },
            network: [PolusVent.RightSeismic],
        },
        [PolusVent.OutsideAdmin]: {
            id: PolusVent.OutsideAdmin,
            position: {
                x: 18.929123,
                y: -24.487068,
            },
            network: [PolusVent.Admin],
        },
    },
    [GameMap.AprilFoolsTheSkeld]: {},
    [GameMap.Airship]: {
        [AirshipVent.Vault]: {
            id: AirshipVent.Vault,
            position: {
                x: -12.6322,
                y: 8.4735,
            },
            network: [AirshipVent.Cockpit],
        },
        [AirshipVent.Cockpit]: {
            id: AirshipVent.Cockpit,
            position: {
                x: -22.099,
                y: -1.512,
            },
            network: [AirshipVent.Vault, AirshipVent.ViewingDeck],
        },
        [AirshipVent.ViewingDeck]: {
            id: AirshipVent.ViewingDeck,
            position: {
                x: -15.659,
                y: -11.6991,
            },
            network: [AirshipVent.Cockpit],
        },
        [AirshipVent.Engine]: {
            id: AirshipVent.Engine,
            position: {
                x: 0.203,
                y: -2.5361,
            },
            network: [AirshipVent.Kitchen, AirshipVent.LowerMainHall],
        },
        [AirshipVent.Kitchen]: {
            id: AirshipVent.Kitchen,
            position: {
                x: -2.6019,
                y: -9.338,
            },
            network: [AirshipVent.Engine, AirshipVent.LowerMainHall],
        },
        [AirshipVent.UpperMainHall]: {
            id: AirshipVent.UpperMainHall,
            position: {
                x: 7.021,
                y: -3.730999,
            },
            network: [AirshipVent.RightGapRoom, AirshipVent.LeftGapRoom],
        },
        [AirshipVent.LowerMainHall]: {
            id: AirshipVent.LowerMainHall,
            position: {
                x: 9.814,
                y: 3.206,
            },
            network: [AirshipVent.Engine, AirshipVent.Kitchen],
        },
        [AirshipVent.RightGapRoom]: {
            id: AirshipVent.RightGapRoom,
            position: {
                x: 12.663,
                y: 5.922,
            },
            network: [AirshipVent.UpperMainHall, AirshipVent.LeftGapRoom],
        },
        [AirshipVent.LeftGapRoom]: {
            id: AirshipVent.LeftGapRoom,
            position: {
                x: 3.605,
                y: 6.923,
            },
            network: [AirshipVent.UpperMainHall, AirshipVent.RightGapRoom],
        },
        [AirshipVent.Showers]: {
            id: AirshipVent.Showers,
            position: {
                x: 23.9869,
                y: -1.386,
            },
            network: [AirshipVent.Records, AirshipVent.CargoBay],
        },
        [AirshipVent.Records]: {
            id: AirshipVent.Records,
            position: {
                x: 23.2799,
                y: 8.259998,
            },
            network: [AirshipVent.Showers, AirshipVent.CargoBay],
        },
        [AirshipVent.CargoBay]: {
            id: AirshipVent.CargoBay,
            position: {
                x: 30.4409,
                y: -3.577,
            },
            network: [AirshipVent.Showers, AirshipVent.Records],
        },
    },
};
