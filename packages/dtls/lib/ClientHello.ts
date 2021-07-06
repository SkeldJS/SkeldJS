import { HazelReader, HazelWriter } from "@skeldjs/util";
import { NamedCurve } from "./enums/NamedCurve";
import { CipherSuite } from "./enums/CipherSuite";
import { CompressionMethod } from "./enums/CompressionMethod";
import { ExtensionType } from "./enums/ExtensionType";
import { ProtocolVersion } from "./enums/ProtocolVersion";

export class Extension {
    constructor(
        public readonly extType: ExtensionType
    ) {}

    static Deserialize(reader: HazelReader, extType: ExtensionType) {
        switch (extType) {
            case ExtensionType.EllipticCurves:
                const supportedCurvesLen = reader.uint16(true);
                const curveReader = reader.bytes(supportedCurvesLen);

                const supportedCurves: NamedCurve[] = [];
                while (curveReader.left) {
                    supportedCurves.push(curveReader.uint16(true));
                }

                return new EllipticCurvesExtension(supportedCurves);
        }
    }
}

export class EllipticCurvesExtension extends Extension {
    constructor(
        public readonly supportedCurves: NamedCurve[]
    ) {
        super(ExtensionType.EllipticCurves);
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(this.supportedCurves.length * 2, true);
        for (const curve of this.supportedCurves) {
            writer.uint16(curve, true);
        }
    }
}

export class ClientHello {
    constructor(
        public readonly random: Buffer,
        public readonly cookie: Buffer,
        public readonly cipherSuites: CipherSuite[],
        public readonly extensions: (EllipticCurvesExtension)[]
    ) {}

    static Deserialize(reader: HazelReader) {
        const protocolVersion = reader.uint16(true);
        if (protocolVersion !== ProtocolVersion.DTLS1_2) {
            throw new Error("Bad protocol version: " + protocolVersion);
        }

        const randomBytes = reader.bytes(32);
        const sessionIdLen = reader.uint8();
        /* const sessionId =*/ reader.bytes(sessionIdLen);

        const cookieLen = reader.uint8();
        const cookieBytes = reader.bytes(cookieLen);

        const cipherSuitesLen = reader.uint16(true);
        const csuiteReader = reader.bytes(cipherSuitesLen);

        const cipherSuites: number[] = [];
        while (csuiteReader.left) {
            cipherSuites.push(csuiteReader.uint16(true));
        }

        const compressionMethodsLen = reader.uint8();
        let flag = false;
        for (let i = 0; i < compressionMethodsLen; i++) {
            const compressionMethod = reader.uint8();
            if (compressionMethod === CompressionMethod.Null) {
                flag = true;
                break;
            }
        }

        if (!flag) {
            throw new Error("No null compression method");
        }

        const extensions: (EllipticCurvesExtension)[] = [];
        while (reader.left) {
            const extType = reader.uint16(true);
            const extLen = reader.uint16(true);
            const extReader = reader.bytes(extLen);
            const ext = extReader.read(Extension, extType);
            if (ext) {
                extensions.push(ext);
            }
        }

        return new ClientHello(
            randomBytes.buffer,
            cookieBytes.buffer,
            cipherSuites,
            extensions
        );
    }

    Serialize(writer: HazelWriter) {
        writer.uint16(ProtocolVersion.DTLS1_2, true);
        writer.bytes(this.random);

        writer.uint8(0); // session id

        writer.uint8(this.cookie.byteLength);
        writer.bytes(this.cookie);

        writer.uint16(this.cipherSuites.length * 2, true);
        for (const suite of this.cipherSuites) {
            writer.uint16(suite, true);
        }
        writer.uint8(1); // num compression methods
        writer.uint8(CompressionMethod.Null);

        const extensionsWriter = HazelWriter.alloc(0);
        for (const extension of this.extensions) {
            extensionsWriter.uint16(extension.extType, true);

            const extWriter = HazelWriter.alloc(0);
            extWriter.write(extension);

            extensionsWriter.uint16(extWriter.size, true);
            extensionsWriter.bytes(extWriter);
        }

        writer.uint16(extensionsWriter.size, true);
        writer.bytes(extensionsWriter);
    }

    getSupportedEllipticCurves() {
        const ellipticCurveExt = this.extensions.find(ext => ext.extType === ExtensionType.EllipticCurves);

        if (ellipticCurveExt) {
            return ellipticCurveExt;
        }

        return undefined;
    }

    hasCurve(curve: NamedCurve) {
        const curvesExt = this.getSupportedEllipticCurves();

        return curvesExt?.supportedCurves?.includes(curve);
    }
}
