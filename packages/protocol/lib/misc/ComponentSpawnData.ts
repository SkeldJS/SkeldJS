import { HazelReader, HazelWriter } from "@skeldjs/util";

export class ComponentSpawnData {
    readonly netid: number;
    readonly data: Buffer;

    constructor(netid: number, data: Buffer) {
        this.netid = netid;
        this.data = data;
    }

    static Deserialize(reader: HazelReader) {
        const netid = reader.upacked();
        const [, data] = reader.message();

        return new ComponentSpawnData(netid, data.buffer);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.netid);
        writer.begin(1);
        writer.bytes(this.data);
        writer.end();
    }

    clone() {
        return new ComponentSpawnData(this.netid, Buffer.from(this.data));
    }
}
