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

import { TheFungleVent } from "@skeldjs/constant";
import { VentInfo } from "../types";

export const TheFungleVents: Record<number, VentInfo> = {
    [TheFungleVent.CommunicationsVent]: {
        id: TheFungleVent.CommunicationsVent,
        position: {
            x: 25.220001,
            y: 10.965
        },
        network: [TheFungleVent.LookoutVent, TheFungleVent.NorthEastJungleVent]
    },
    [TheFungleVent.KitchenVent]: {
        id: TheFungleVent.KitchenVent,
        position: {
            x: -15.359,
            y: -9.783001
        },
        network: [TheFungleVent.SouthWestJungleVent]
    },
    [TheFungleVent.LookoutVent]: {
        id: TheFungleVent.LookoutVent,
        position: {
            x: 9.366,
            y: 0.63
        },
        network: [TheFungleVent.NorthEastJungleVent]
    },
    [TheFungleVent.StorageVent]: {
        id: TheFungleVent.StorageVent,
        position: {
            x: 2.864,
            y: 0.9180002
        },
        network: [TheFungleVent.MeetingRoomVent, TheFungleVent.NorthWestJungleVent]
    },
    [TheFungleVent.NorthWestJungleVent]: {
        id: TheFungleVent.NorthWestJungleVent,
        position: {
            x: -2.518,
            y: -8.986
        },
        network: [TheFungleVent.RecRoomVent, TheFungleVent.StorageVent]
    },
    [TheFungleVent.NorthEastJungleVent]: {
        id: TheFungleVent.NorthEastJungleVent,
        position: {
            x: 22.677,
            y: -8.497
        },
        network: [TheFungleVent.LookoutVent]
    },
    [TheFungleVent.SouthWestJungleVent]: {
        id: TheFungleVent.SouthWestJungleVent,
        position: {
            x: 1.3000002,
            y: -10.515
        },
        network: [TheFungleVent.KitchenVent, TheFungleVent.SouthEastJungleVent]
    },
    [TheFungleVent.SouthEastJungleVent]: {
        id: TheFungleVent.SouthEastJungleVent,
        position: {
            x: 15.150001,
            y: -16.42
        },
        network: [TheFungleVent.SouthWestJungleVent]
    },
    [TheFungleVent.RecRoomVent]: {
        id: TheFungleVent.RecRoomVent,
        position: {
            x: -16.9,
            y: -2.571
        },
        network: [TheFungleVent.MeetingRoomVent, TheFungleVent.NorthWestJungleVent]
    },
    [TheFungleVent.MeetingRoomVent]: {
        id: TheFungleVent.MeetingRoomVent,
        position: {
            x: -12.233,
            y: 8.061
        },
        network: [TheFungleVent.RecRoomVent, TheFungleVent.StorageVent]
    }
};