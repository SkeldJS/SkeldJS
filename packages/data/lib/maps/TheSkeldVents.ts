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

import { TheSkeldVent } from "@skeldjs/constant";
import { VentInfo } from "../types";

export const TheSkeldVents: Record<number, VentInfo> = {
    [TheSkeldVent.Admin]: {
        id: TheSkeldVent.Admin,
        position: {
            x: 2.544,
            y: -9.955201
        },
        network: [TheSkeldVent.Cafeteria, TheSkeldVent.RightHallway]
    },
    [TheSkeldVent.RightHallway]: {
        id: TheSkeldVent.RightHallway,
        position: {
            x: 9.384,
            y: -6.438
        },
        network: [TheSkeldVent.Cafeteria]
    },
    [TheSkeldVent.Cafeteria]: {
        id: TheSkeldVent.Cafeteria,
        position: {
            x: 4.2588,
            y: -0.27600002
        },
        network: [TheSkeldVent.RightHallway]
    },
    [TheSkeldVent.Electrical]: {
        id: TheSkeldVent.Electrical,
        position: {
            x: -9.7764,
            y: -8.034
        },
        network: [TheSkeldVent.Security, TheSkeldVent.MedBay]
    },
    [TheSkeldVent.UpperEngine]: {
        id: TheSkeldVent.UpperEngine,
        position: {
            x: -15.288,
            y: 2.52
        },
        network: [TheSkeldVent.UpperReactor]
    },
    [TheSkeldVent.Security]: {
        id: TheSkeldVent.Security,
        position: {
            x: -12.534,
            y: -6.9492
        },
        network: [TheSkeldVent.MedBay, TheSkeldVent.Electrical]
    },
    [TheSkeldVent.MedBay]: {
        id: TheSkeldVent.MedBay,
        position: {
            x: -10.608001,
            y: -4.176
        },
        network: [TheSkeldVent.Electrical, TheSkeldVent.Security]
    },
    [TheSkeldVent.Weapons]: {
        id: TheSkeldVent.Weapons,
        position: {
            x: 8.820001,
            y: 3.3240001
        },
        network: [TheSkeldVent.UpperNavigation]
    },
    [TheSkeldVent.LowerReactor]: {
        id: TheSkeldVent.LowerReactor,
        position: {
            x: -20.796001,
            y: -6.9528003
        },
        network: [TheSkeldVent.LowerEngine]
    },
    [TheSkeldVent.LowerEngine]: {
        id: TheSkeldVent.LowerEngine,
        position: {
            x: -15.2508,
            y: -13.656001
        },
        network: [TheSkeldVent.LowerReactor]
    },
    [TheSkeldVent.Shields]: {
        id: TheSkeldVent.Shields,
        position: {
            x: 9.5232,
            y: -14.337601
        },
        network: [TheSkeldVent.LowerNavigation]
    },
    [TheSkeldVent.UpperReactor]: {
        id: TheSkeldVent.UpperReactor,
        position: {
            x: -21.876,
            y: -3.0516002
        },
        network: [TheSkeldVent.UpperEngine]
    },
    [TheSkeldVent.UpperNavigation]: {
        id: TheSkeldVent.UpperNavigation,
        position: {
            x: 16.008001,
            y: -3.1680002
        },
        network: [TheSkeldVent.Weapons]
    },
    [TheSkeldVent.LowerNavigation]: {
        id: TheSkeldVent.LowerNavigation,
        position: {
            x: 16.008001,
            y: -6.3840003
        },
        network: [TheSkeldVent.Shields]
    }
};