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

import { AirshipVent } from "@skeldjs/constant";
import { VentInfo } from "../types";

export const AirshipVents: Record<number, VentInfo> = {
    [AirshipVent.Vault]: {
        id: AirshipVent.Vault,
        position: {
            x: -12.6321983,
            y: 8.47350025
        },
        network: [AirshipVent.Cockpit]
    },
    [AirshipVent.Cockpit]: {
        id: AirshipVent.Cockpit,
        position: {
            x: -22.098999,
            y: -1.51200008
        },
        network: [AirshipVent.ViewingDeck]
    },
    [AirshipVent.ViewingDeck]: {
        id: AirshipVent.ViewingDeck,
        position: {
            x: -15.6589994,
            y: -11.6991005
        },
        network: [AirshipVent.Cockpit]
    },
    [AirshipVent.Engine]: {
        id: AirshipVent.Engine,
        position: {
            x: 0.202999964,
            y: -2.53610039
        },
        network: [AirshipVent.Kitchen, AirshipVent.UpperMainHall]
    },
    [AirshipVent.Kitchen]: {
        id: AirshipVent.Kitchen,
        position: {
            x: -2.60189986,
            y: -9.3380003
        },
        network: [AirshipVent.Engine, AirshipVent.UpperMainHall]
    },
    [AirshipVent.UpperMainHall]: {
        id: AirshipVent.UpperMainHall,
        position: {
            x: 7.02100039,
            y: -3.73099947
        },
        network: [AirshipVent.Engine, AirshipVent.Kitchen]
    },
    [AirshipVent.LowerMainHall]: {
        id: AirshipVent.LowerMainHall,
        position: {
            x: 9.81400013,
            y: 3.20600033
        },
        network: [AirshipVent.LeftGapRoom, AirshipVent.RightGapRoom]
    },
    [AirshipVent.RightGapRoom]: {
        id: AirshipVent.RightGapRoom,
        position: {
            x: 12.6630001,
            y: 5.92199993
        },
        network: [AirshipVent.LeftGapRoom, AirshipVent.LowerMainHall]
    },
    [AirshipVent.LeftGapRoom]: {
        id: AirshipVent.LeftGapRoom,
        position: {
            x: 3.60499978,
            y: 6.92300034
        },
        network: [AirshipVent.RightGapRoom, AirshipVent.LowerMainHall]
    },
    [AirshipVent.Showers]: {
        id: AirshipVent.Showers,
        position: {
            x: 23.9869003,
            y: -1.38600004
        },
        network: [AirshipVent.Records, AirshipVent.CargoBay]
    },
    [AirshipVent.Records]: {
        id: AirshipVent.Records,
        position: {
            x: 23.2798977,
            y: 8.25999832
        },
        network: [AirshipVent.Showers, AirshipVent.CargoBay]
    },
    [AirshipVent.CargoBay]: {
        id: AirshipVent.CargoBay,
        position: {
            x: 30.440897,
            y: -3.57700014
        },
        network: [AirshipVent.Showers, AirshipVent.Records]
    }
};
