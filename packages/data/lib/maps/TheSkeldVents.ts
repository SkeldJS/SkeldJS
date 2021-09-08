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
    
import { TheSkeldVent } from "@skeldjs/constant";

interface VentDataModel {
    id: number;
    position: { x: number; y: number };
    network: number[];
}

export const TheSkeldVents: Record<number, VentDataModel> = {
    [TheSkeldVent.Admin]: {
        id: TheSkeldVent.Admin,
        position: {
            x: 2.54399991,
            y: -9.95520115
        },
        network: [TheSkeldVent.Cafeteria, TheSkeldVent.RightHallway]
    },
    [TheSkeldVent.RightHallway]: {
        id: TheSkeldVent.RightHallway,
        position: {
            x: 9.38399982,
            y: -6.4380002
        },
        network: [TheSkeldVent.Cafeteria]
    },
    [TheSkeldVent.Cafeteria]: {
        id: TheSkeldVent.Cafeteria,
        position: {
            x: 4.25880003,
            y: -0.276000023
        },
        network: [TheSkeldVent.RightHallway]
    },
    [TheSkeldVent.Electrical]: {
        id: TheSkeldVent.Electrical,
        position: {
            x: -9.77639961,
            y: -8.0340004
        },
        network: [TheSkeldVent.Security, TheSkeldVent.MedBay]
    },
    [TheSkeldVent.UpperEngine]: {
        id: TheSkeldVent.UpperEngine,
        position: {
            x: -15.2880001,
            y: 2.51999998
        },
        network: [TheSkeldVent.UpperReactor]
    },
    [TheSkeldVent.Security]: {
        id: TheSkeldVent.Security,
        position: {
            x: -12.5340004,
            y: -6.94920015
        },
        network: [TheSkeldVent.MedBay, TheSkeldVent.Electrical]
    },
    [TheSkeldVent.MedBay]: {
        id: TheSkeldVent.MedBay,
        position: {
            x: -10.6080008,
            y: -4.17600012
        },
        network: [TheSkeldVent.Electrical, TheSkeldVent.Security]
    },
    [TheSkeldVent.Weapons]: {
        id: TheSkeldVent.Weapons,
        position: {
            x: 8.82000065,
            y: 3.32400012
        },
        network: [TheSkeldVent.UpperNavigation]
    },
    [TheSkeldVent.LowerReactor]: {
        id: TheSkeldVent.LowerReactor,
        position: {
            x: -20.7960014,
            y: -6.95280027
        },
        network: [TheSkeldVent.LowerEngine]
    },
    [TheSkeldVent.LowerEngine]: {
        id: TheSkeldVent.LowerEngine,
        position: {
            x: -15.2508001,
            y: -13.6560011
        },
        network: [TheSkeldVent.LowerReactor]
    },
    [TheSkeldVent.Shields]: {
        id: TheSkeldVent.Shields,
        position: {
            x: 9.52320004,
            y: -14.3376007
        },
        network: [TheSkeldVent.LowerNavigation]
    },
    [TheSkeldVent.UpperReactor]: {
        id: TheSkeldVent.UpperReactor,
        position: {
            x: -21.8759995,
            y: -3.05160022
        },
        network: [TheSkeldVent.UpperEngine]
    },
    [TheSkeldVent.UpperNavigation]: {
        id: TheSkeldVent.UpperNavigation,
        position: {
            x: 16.0080013,
            y: -3.16800022
        },
        network: [TheSkeldVent.Weapons]
    },
    [TheSkeldVent.LowerNavigation]: {
        id: TheSkeldVent.LowerNavigation,
        position: {
            x: 16.0080013,
            y: -6.3840003
        },
        network: [TheSkeldVent.Shields]
    }
};