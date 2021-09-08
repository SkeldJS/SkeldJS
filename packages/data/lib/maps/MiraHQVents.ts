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
    
import { MiraHQVent } from "@skeldjs/constant";

interface VentDataModel {
    id: number;
    position: { x: number; y: number };
    network: number[];
}

export const MiraHQVents: Record<number, VentDataModel> = {
    [MiraHQVent.Balcony]: {
        id: MiraHQVent.Balcony,
        position: {
            x: 23.7699986,
            y: -1.93999994
        },
        network: [MiraHQVent.MedBay, MiraHQVent.Cafeteria]
    },
    [MiraHQVent.Cafeteria]: {
        id: MiraHQVent.Cafeteria,
        position: {
            x: 23.8999996,
            y: 7.18000031
        },
        network: [MiraHQVent.Admin, MiraHQVent.Balcony]
    },
    [MiraHQVent.Reactor]: {
        id: MiraHQVent.Reactor,
        position: {
            x: 0.480000138,
            y: 10.6970005
        },
        network: [MiraHQVent.Laboratory, MiraHQVent.Decontamination, MiraHQVent.Launchpad]
    },
    [MiraHQVent.Laboratory]: {
        id: MiraHQVent.Laboratory,
        position: {
            x: 11.6060009,
            y: 13.816
        },
        network: [MiraHQVent.Reactor, MiraHQVent.Decontamination, MiraHQVent.Office]
    },
    [MiraHQVent.Office]: {
        id: MiraHQVent.Office,
        position: {
            x: 13.2800007,
            y: 20.1299992
        },
        network: [MiraHQVent.Laboratory, MiraHQVent.Admin, MiraHQVent.Greenhouse]
    },
    [MiraHQVent.Admin]: {
        id: MiraHQVent.Admin,
        position: {
            x: 22.3900013,
            y: 17.2299995
        },
        network: [MiraHQVent.Greenhouse, MiraHQVent.Cafeteria, MiraHQVent.Office]
    },
    [MiraHQVent.Greenhouse]: {
        id: MiraHQVent.Greenhouse,
        position: {
            x: 17.8500004,
            y: 25.2299995
        },
        network: [MiraHQVent.Admin, MiraHQVent.Office]
    },
    [MiraHQVent.MedBay]: {
        id: MiraHQVent.MedBay,
        position: {
            x: 15.4099998,
            y: -1.81999969
        },
        network: [MiraHQVent.Balcony, MiraHQVent.LockerRoom]
    },
    [MiraHQVent.Decontamination]: {
        id: MiraHQVent.Decontamination,
        position: {
            x: 6.82999992,
            y: 3.14499998
        },
        network: [MiraHQVent.Reactor, MiraHQVent.LockerRoom, MiraHQVent.Laboratory]
    },
    [MiraHQVent.LockerRoom]: {
        id: MiraHQVent.LockerRoom,
        position: {
            x: 4.28999996,
            y: 0.529999733
        },
        network: [MiraHQVent.MedBay, MiraHQVent.Launchpad, MiraHQVent.Decontamination]
    },
    [MiraHQVent.Launchpad]: {
        id: MiraHQVent.Launchpad,
        position: {
            x: -6.18000031,
            y: 3.56000018
        },
        network: [MiraHQVent.Reactor, MiraHQVent.LockerRoom]
    }
};