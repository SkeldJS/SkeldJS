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

import { MiraHQVent } from "@skeldjs/constant";
import { VentInfo } from "../types";

export const MiraHQVents: Record<number, VentInfo> = {
    [MiraHQVent.Balcony]: {
        id: MiraHQVent.Balcony,
        position: {
            x: 23.769999,
            y: -1.9399999
        },
        network: [MiraHQVent.MedBay, MiraHQVent.Cafeteria]
    },
    [MiraHQVent.Cafeteria]: {
        id: MiraHQVent.Cafeteria,
        position: {
            x: 23.9,
            y: 7.1800003
        },
        network: [MiraHQVent.Admin, MiraHQVent.Balcony]
    },
    [MiraHQVent.Reactor]: {
        id: MiraHQVent.Reactor,
        position: {
            x: 0.48000014,
            y: 10.6970005
        },
        network: [MiraHQVent.Laboratory, MiraHQVent.Decontamination, MiraHQVent.Launchpad]
    },
    [MiraHQVent.Laboratory]: {
        id: MiraHQVent.Laboratory,
        position: {
            x: 11.606001,
            y: 13.816
        },
        network: [MiraHQVent.Reactor, MiraHQVent.Decontamination, MiraHQVent.Office]
    },
    [MiraHQVent.Office]: {
        id: MiraHQVent.Office,
        position: {
            x: 13.280001,
            y: 20.13
        },
        network: [MiraHQVent.Laboratory, MiraHQVent.Admin, MiraHQVent.Greenhouse]
    },
    [MiraHQVent.Admin]: {
        id: MiraHQVent.Admin,
        position: {
            x: 22.390001,
            y: 17.23
        },
        network: [MiraHQVent.Greenhouse, MiraHQVent.Cafeteria, MiraHQVent.Office]
    },
    [MiraHQVent.Greenhouse]: {
        id: MiraHQVent.Greenhouse,
        position: {
            x: 17.85,
            y: 25.23
        },
        network: [MiraHQVent.Admin, MiraHQVent.Office]
    },
    [MiraHQVent.MedBay]: {
        id: MiraHQVent.MedBay,
        position: {
            x: 15.41,
            y: -1.8199997
        },
        network: [MiraHQVent.Balcony, MiraHQVent.LockerRoom]
    },
    [MiraHQVent.Decontamination]: {
        id: MiraHQVent.Decontamination,
        position: {
            x: 6.83,
            y: 3.145
        },
        network: [MiraHQVent.Reactor, MiraHQVent.LockerRoom, MiraHQVent.Laboratory]
    },
    [MiraHQVent.LockerRoom]: {
        id: MiraHQVent.LockerRoom,
        position: {
            x: 4.29,
            y: 0.52999973
        },
        network: [MiraHQVent.MedBay, MiraHQVent.Launchpad, MiraHQVent.Decontamination]
    },
    [MiraHQVent.Launchpad]: {
        id: MiraHQVent.Launchpad,
        position: {
            x: -6.1800003,
            y: 3.5600002
        },
        network: [MiraHQVent.Reactor, MiraHQVent.LockerRoom]
    }
};