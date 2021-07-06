import { Certificate as x509Certificate } from "@fidm/x509";
import { HazelReader, HazelWriter } from "@skeldjs/util";
import { uint24 } from "./types/uint24";

export class Certificate {
    constructor(
        public readonly certificates: x509Certificate[]
    ) {}

    static Deserialize(reader: HazelReader) {
        const totalLength = reader.read(uint24, true);

        const certReader = reader.bytes(totalLength);
        const certificates: x509Certificate[] = [];

        while (certReader.left) {
            const certLen = certReader.read(uint24, true);
            const asn11cert = certReader.bytes(certLen);

            const pem = Buffer.from("-----BEGIN CERTIFICATE-----\n" + asn11cert.toString("base64") + "\n-----END CERTIFICATE-----");

            const cert = x509Certificate.fromPEM(pem);
            certificates.push(cert);
        }

        return new Certificate(certificates);
    }

    Serialize(writer: HazelWriter) {
        const certWriter = HazelWriter.alloc(0);
        for (const certificate of this.certificates) {
            certWriter.write(uint24, certificate.raw.byteLength, true);
            certWriter.bytes(certificate.raw);
        }
        writer.write(uint24, certWriter.size, true);
        writer.bytes(certWriter);
    }
}
