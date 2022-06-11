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

import { PolusVent } from "@skeldjs/constant";
import { VentInfo } from "../types";

export const PolusVents: Record<number, VentInfo> = {
    [PolusVent.Security]: {
        id: PolusVent.Security,
        position: {
            x: 1.9289999,
            y: -9.55800056
        },
        network: [PolusVent.O2, PolusVent.Electrical]
    },
    [PolusVent.Electrical]: {
        id: PolusVent.Electrical,
        position: {
            x: 6.9000001,
            y: -14.4099998
        },
        network: [PolusVent.O2]
    },
    [PolusVent.O2]: {
        id: PolusVent.O2,
        position: {
            x: 3.50999999,
            y: -16.5799999
        },
        network: [PolusVent.Electrical]
    },
    [PolusVent.Communications]: {
        id: PolusVent.Communications,
        position: {
            x: 12.3039999,
            y: -18.8979988
        },
        network: [PolusVent.Storage, PolusVent.Office]
    },
    [PolusVent.Office]: {
        id: PolusVent.Office,
        position: {
            x: 16.3789997,
            y: -19.5990009
        },
        network: [PolusVent.Communications, PolusVent.Storage]
    },
    [PolusVent.Admin]: {
        id: PolusVent.Admin,
        position: {
            x: 20.0890026,
            y: -25.5170002
        },
        network: [PolusVent.OutsideAdmin, PolusVent.LavaPool]
    },
    [PolusVent.Laboratory]: {
        id: PolusVent.Laboratory,
        position: {
            x: 32.9630013,
            y: -9.52600002
        },
        network: [PolusVent.LavaPool]
    },
    [PolusVent.LavaPool]: {
        id: PolusVent.LavaPool,
        position: {
            x: 30.9070034,
            y: -11.8600006
        },
        network: [PolusVent.Laboratory, PolusVent.Admin]
    },
    [PolusVent.Storage]: {
        id: PolusVent.Storage,
        position: {
            x: 22,
            y: -12.1900005
        },
        network: [PolusVent.Communications, PolusVent.Office]
    },
    [PolusVent.RightSeismic]: {
        id: PolusVent.RightSeismic,
        position: {
            x: 23.7199993,
            y: -7.82000017
        },
        network: [PolusVent.LeftSeismic]
    },
    [PolusVent.LeftSeismic]: {
        id: PolusVent.LeftSeismic,
        position: {
            x: 9.64000034,
            y: -7.71999979
        },
        network: [PolusVent.RightSeismic]
    },
    [PolusVent.OutsideAdmin]: {
        id: PolusVent.OutsideAdmin,
        position: {
            x: 18.9300003,
            y: -24.8500004
        },
        network: [PolusVent.Admin]
    }
};
