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

import { AirshipVent } from "@skeldjs/constant";
import { VentInfo } from "../types";

export const AirshipVents: Record<number, VentInfo> = {
    [AirshipVent.Vault]: {
        id: AirshipVent.Vault,
        position: {
            x: -12.632198,
            y: 8.4735
        },
        network: [AirshipVent.Cockpit]
    },
    [AirshipVent.Cockpit]: {
        id: AirshipVent.Cockpit,
        position: {
            x: -22.098999,
            y: -1.5120001
        },
        network: [AirshipVent.ViewingDeck]
    },
    [AirshipVent.ViewingDeck]: {
        id: AirshipVent.ViewingDeck,
        position: {
            x: -15.658999,
            y: -11.6991005
        },
        network: [AirshipVent.Cockpit]
    },
    [AirshipVent.Engine]: {
        id: AirshipVent.Engine,
        position: {
            x: 0.20299996,
            y: -2.5361004
        },
        network: [AirshipVent.Kitchen, AirshipVent.UpperMainHall]
    },
    [AirshipVent.Kitchen]: {
        id: AirshipVent.Kitchen,
        position: {
            x: -2.6018999,
            y: -9.338
        },
        network: [AirshipVent.Engine, AirshipVent.UpperMainHall]
    },
    [AirshipVent.UpperMainHall]: {
        id: AirshipVent.UpperMainHall,
        position: {
            x: 7.0210004,
            y: -3.7309995
        },
        network: [AirshipVent.Engine, AirshipVent.Kitchen]
    },
    [AirshipVent.LowerMainHall]: {
        id: AirshipVent.LowerMainHall,
        position: {
            x: 9.814,
            y: 3.2060003
        },
        network: [AirshipVent.LeftGapRoom, AirshipVent.RightGapRoom]
    },
    [AirshipVent.RightGapRoom]: {
        id: AirshipVent.RightGapRoom,
        position: {
            x: 12.663,
            y: 5.922
        },
        network: [AirshipVent.LeftGapRoom, AirshipVent.LowerMainHall]
    },
    [AirshipVent.LeftGapRoom]: {
        id: AirshipVent.LeftGapRoom,
        position: {
            x: 3.6049998,
            y: 6.9230003
        },
        network: [AirshipVent.RightGapRoom, AirshipVent.LowerMainHall]
    },
    [AirshipVent.Showers]: {
        id: AirshipVent.Showers,
        position: {
            x: 23.9869,
            y: -1.386
        },
        network: [AirshipVent.Records, AirshipVent.CargoBay]
    },
    [AirshipVent.Records]: {
        id: AirshipVent.Records,
        position: {
            x: 23.279898,
            y: 8.259998
        },
        network: [AirshipVent.Showers, AirshipVent.CargoBay]
    },
    [AirshipVent.CargoBay]: {
        id: AirshipVent.CargoBay,
        position: {
            x: 30.440897,
            y: -3.5770001
        },
        network: [AirshipVent.Showers, AirshipVent.Records]
    }
};