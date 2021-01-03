import {
    MapID,
    TheSkeldVent,
    MiraHQVent,
    PolusVent
} from "../enum"

/** https://github.com/codyphobe/among-us-protocol/blob/master/07_miscellaneous/04_map_specific_ids_for_vents_and_tasks.md#the-skeld */
export const VentCoords = {
    [MapID.TheSkeld]: {
        [TheSkeldVent.Admin]: {
            x: 2.543373,
            y: -9.59182
        },
        [TheSkeldVent.RightHallway]: {
            x: 9.38308,
            y: -6.0749207
        },
        [TheSkeldVent.Cafeteria]: {
            x: 4.258915,
            y: 0.08728027
        },
        [TheSkeldVent.Electrical]: {
            x: -9.777372,
            y: -9.777372
        },
        [TheSkeldVent.UpperEngine]: {
            x: -15.288929,
            y: -15.288929
        },
        [TheSkeldVent.Security]: {
            x: -12.534981,
            y: -12.534981
        },
        [TheSkeldVent.MedBay]: {
            x: -10.608683,
            y: -10.608683
        },
        [TheSkeldVent.Weapons]: {
            x: 8.819103,
            y: 8.819103
        },
        [TheSkeldVent.LowerReactor]: {
            x: -20.796825,
            y: -20.796825 
        },
        [TheSkeldVent.LowerEngine]: {
            x: -15.251087,
            y: -15.251087
        },
        [TheSkeldVent.Shields]: {
            x: 9.52224,
            y: 9.52224
        },
        [TheSkeldVent.UpperReactor]: {
            x: -21.877165,
            y: -21.877165
        },
        [TheSkeldVent.UpperNavigation]: {
            x: 16.007935,
            y: 16.007935 
        },
        [TheSkeldVent.LowerNavigation]: {
            x: 16.007935,
            y: 16.007935
        }
    },
    [MapID.MiraHQ]: {
        [MiraHQVent.Balcony]: {
            x: 23.769283,
            y: -1.576561
        },
        [MiraHQVent.Cafeteria]: {
            x: 23.899899,
            y: 23.899899
        },
        [MiraHQVent.Reactor]: {
            x: 0.4791336,
            y: 0.4791336
        },
        [MiraHQVent.Labatory]: {
            x: 11.60479,
            y: 11.60479
        },
        [MiraHQVent.Office]: {
            x: 13.279617,
            y: 13.279617
        },
        [MiraHQVent.Admin]: {
            x: 22.38987,
            y: 22.38987
        },
        [MiraHQVent.Greenhouse]: {
            x: 17.848782,
            y: 17.848782
        },
        [MiraHQVent.MedBay]: {
            x: 15.409779,
            y: -1.4569321
        },
        [MiraHQVent.Decontamination]: {
            x: 6.8293304,
            y: 6.8293304
        },
        [MiraHQVent.LockerRoom]: {
            x: 4.289009,
            y: 4.289009
        },
        [MiraHQVent.Launchpad]: {
            x: -6.1811256,
            y: 6.1811256
        }
    },
    [MapID.Polus]: {
        [PolusVent.Security]: {
            x: 1.9281311,
            y: 1.9281311
        },
        [PolusVent.Electrical]: {
            x: 6.8989105,
            y: 6.8989105
        },
        [PolusVent.O2]: {
            x: 3.5089645,
            y: 3.5089645
        },
        [PolusVent.Communications]: {
            x: 12.303043,
            y: 12.303043
        },
        [PolusVent.Office]: {
            x: 16.377811,
            y: 16.377811
        },
        [PolusVent.Admin]: {
            x: 20.088806,
            y: 20.088806
        },
        [PolusVent.Labatory]: {
            x: 32.96254,
            y: 32.96254
        },
        [PolusVent.LavaPool]: {
            x: 30.906845,
            y: 30.906845
        },
        [PolusVent.Storage]: {
            x: 21.999237,
            y: 21.999237
        },
        [PolusVent.RightSeismic]: {
            x: 24.019531,
            y: 24.019531
        },
        [PolusVent.LeftSeismic]: {
            x: 9.639431,
            y: 9.639431
        },
        [PolusVent.OutsideAdmin]: {
            x: 18.929123,
            y: 18.929123
        }
    }
} as const;