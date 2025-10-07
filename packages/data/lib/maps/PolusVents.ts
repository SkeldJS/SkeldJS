/*
    Generated using https://github.com/skeldjs/SkeldJS/tree/master/packages/data/scripts/maps.js
    Data dumped from https://github.com/Impostor/Dumpostor

    Copyright (C) 2025 Edward Smale

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
            y: -9.558001
        },
        network: [PolusVent.O2, PolusVent.Electrical]
    },
    [PolusVent.Electrical]: {
        id: PolusVent.Electrical,
        position: {
            x: 6.9,
            y: -14.41
        },
        network: [PolusVent.O2]
    },
    [PolusVent.O2]: {
        id: PolusVent.O2,
        position: {
            x: 3.51,
            y: -16.58
        },
        network: [PolusVent.Electrical]
    },
    [PolusVent.Communications]: {
        id: PolusVent.Communications,
        position: {
            x: 12.304,
            y: -18.897999
        },
        network: [PolusVent.Storage, PolusVent.Office]
    },
    [PolusVent.Office]: {
        id: PolusVent.Office,
        position: {
            x: 16.379,
            y: -19.599
        },
        network: [PolusVent.Communications, PolusVent.Storage]
    },
    [PolusVent.Admin]: {
        id: PolusVent.Admin,
        position: {
            x: 20.089003,
            y: -25.517
        },
        network: [PolusVent.OutsideAdmin, PolusVent.LavaPool]
    },
    [PolusVent.Laboratory]: {
        id: PolusVent.Laboratory,
        position: {
            x: 32.963,
            y: -9.526
        },
        network: [PolusVent.LavaPool]
    },
    [PolusVent.LavaPool]: {
        id: PolusVent.LavaPool,
        position: {
            x: 30.907003,
            y: -11.860001
        },
        network: [PolusVent.Laboratory, PolusVent.Admin]
    },
    [PolusVent.Storage]: {
        id: PolusVent.Storage,
        position: {
            x: 22,
            y: -12.190001
        },
        network: [PolusVent.Communications, PolusVent.Office]
    },
    [PolusVent.RightSeismic]: {
        id: PolusVent.RightSeismic,
        position: {
            x: 23.72,
            y: -7.82
        },
        network: [PolusVent.LeftSeismic]
    },
    [PolusVent.LeftSeismic]: {
        id: PolusVent.LeftSeismic,
        position: {
            x: 9.64,
            y: -7.72
        },
        network: [PolusVent.RightSeismic]
    },
    [PolusVent.OutsideAdmin]: {
        id: PolusVent.OutsideAdmin,
        position: {
            x: 18.93,
            y: -24.85
        },
        network: [PolusVent.Admin]
    }
};