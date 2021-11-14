import { HazelReader, HazelWriter } from "@skeldjs/util";

export class ComponentSpawnData {
    readonly netId: number;
    readonly data: Buffer;

    constructor(netId: number, data: Buffer) {
        this.netId = netId;
        this.data = data;
    }

    static Deserialize(reader: HazelReader) {
        const netId = reader.upacked();
        const [, data] = reader.message();

        return new ComponentSpawnData(netId, data.buffer);
    }

    Serialize(writer: HazelWriter) {
        writer.upacked(this.netId);
        writer.begin(1);
        writer.bytes(this.data);
        writer.end();
    }

    clone() {
        return new ComponentSpawnData(this.netId, Buffer.from(this.data));
    }
}
