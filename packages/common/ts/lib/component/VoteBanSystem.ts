import { HazelBuffer } from "@skeldjs/util";

import { SpawnID } from "@skeldjs/constant";

import { Networkable } from "../Networkable";
import { Global } from "../Global";
import { Room } from "../Room";

export interface VoteBanSystemData {
    clients: Map<number, [number, number, number]>;
}

export class VoteBanSystem extends Networkable<Global> {
    static type = SpawnID.GameData;
    type = SpawnID.GameData;
    
    static classname = "VoteBanSystem";
    classname = "VoteBanSystem";
    
    clients: Map<number, [number, number, number]>;

    constructor(room: Room, netid: number, ownerid: number, data?: HazelBuffer|VoteBanSystemData) {
        super(room, netid, ownerid, data);

        this.clients = new Map;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Deserialize(reader: HazelBuffer, spawn: boolean = false) {
        const num_players = reader.upacked();

        for (let i = 0; i < num_players; i++) {
            const clientid = reader.uint32();

            if (this.clients.get(clientid)) {
                this.clients.set(clientid, [null, null, null]);
            }
            
            this.clients.set(clientid, [null, null, null]);
            for (let i = 0; i < 3; i++) {
                reader.upacked();
            }
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    Serialize(writer: HazelBuffer, spawn: boolean = false) {
        writer.upacked(this.clients.size);

        for (const [ clientid, voters ] of this.clients) {
            writer.uint32(clientid);

            for (let i = 0; i < 3; i++) {
                writer.upacked(voters[i]);
            }
        }
    }
}