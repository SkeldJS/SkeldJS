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

import { AprilFoolsTheSkeldVent } from "@skeldjs/constant";
import { VentInfo } from "../types";

export const AprilFoolsTheSkeldVents: Record<number, VentInfo> = {
    [AprilFoolsTheSkeldVent.Admin]: {
        id: AprilFoolsTheSkeldVent.Admin,
        position: {
            x: -2.544,
            y: -9.955201
        },
        network: [AprilFoolsTheSkeldVent.Cafeteria, AprilFoolsTheSkeldVent.RightHallway]
    },
    [AprilFoolsTheSkeldVent.RightHallway]: {
        id: AprilFoolsTheSkeldVent.RightHallway,
        position: {
            x: -9.384,
            y: -6.438
        },
        network: [AprilFoolsTheSkeldVent.Cafeteria]
    },
    [AprilFoolsTheSkeldVent.Cafeteria]: {
        id: AprilFoolsTheSkeldVent.Cafeteria,
        position: {
            x: -4.2588,
            y: -0.27600002
        },
        network: [AprilFoolsTheSkeldVent.RightHallway]
    },
    [AprilFoolsTheSkeldVent.Electrical]: {
        id: AprilFoolsTheSkeldVent.Electrical,
        position: {
            x: 9.7764,
            y: -8.034
        },
        network: [AprilFoolsTheSkeldVent.Security, AprilFoolsTheSkeldVent.MedBay]
    },
    [AprilFoolsTheSkeldVent.UpperEngine]: {
        id: AprilFoolsTheSkeldVent.UpperEngine,
        position: {
            x: 15.288,
            y: 2.52
        },
        network: [AprilFoolsTheSkeldVent.UpperReactor]
    },
    [AprilFoolsTheSkeldVent.Security]: {
        id: AprilFoolsTheSkeldVent.Security,
        position: {
            x: 12.534,
            y: -6.9492
        },
        network: [AprilFoolsTheSkeldVent.MedBay, AprilFoolsTheSkeldVent.Electrical]
    },
    [AprilFoolsTheSkeldVent.MedBay]: {
        id: AprilFoolsTheSkeldVent.MedBay,
        position: {
            x: 10.608001,
            y: -4.176
        },
        network: [AprilFoolsTheSkeldVent.Security, AprilFoolsTheSkeldVent.Electrical]
    },
    [AprilFoolsTheSkeldVent.Weapons]: {
        id: AprilFoolsTheSkeldVent.Weapons,
        position: {
            x: -8.820001,
            y: 3.3240001
        },
        network: [AprilFoolsTheSkeldVent.UpperNavigation]
    },
    [AprilFoolsTheSkeldVent.LowerReactor]: {
        id: AprilFoolsTheSkeldVent.LowerReactor,
        position: {
            x: 20.796001,
            y: -6.9528003
        },
        network: [AprilFoolsTheSkeldVent.LowerEngine]
    },
    [AprilFoolsTheSkeldVent.LowerEngine]: {
        id: AprilFoolsTheSkeldVent.LowerEngine,
        position: {
            x: 15.2508,
            y: -13.656001
        },
        network: [AprilFoolsTheSkeldVent.LowerReactor]
    },
    [AprilFoolsTheSkeldVent.Shields]: {
        id: AprilFoolsTheSkeldVent.Shields,
        position: {
            x: -9.5232,
            y: -14.337601
        },
        network: [AprilFoolsTheSkeldVent.LowerNavigation]
    },
    [AprilFoolsTheSkeldVent.UpperReactor]: {
        id: AprilFoolsTheSkeldVent.UpperReactor,
        position: {
            x: 21.876,
            y: -3.0516002
        },
        network: [AprilFoolsTheSkeldVent.UpperEngine]
    },
    [AprilFoolsTheSkeldVent.UpperNavigation]: {
        id: AprilFoolsTheSkeldVent.UpperNavigation,
        position: {
            x: -16.008001,
            y: -3.1680002
        },
        network: [AprilFoolsTheSkeldVent.Weapons]
    },
    [AprilFoolsTheSkeldVent.LowerNavigation]: {
        id: AprilFoolsTheSkeldVent.LowerNavigation,
        position: {
            x: -16.008001,
            y: -6.3840003
        },
        network: [AprilFoolsTheSkeldVent.Shields]
    }
};