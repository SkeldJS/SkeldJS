import crypto from "crypto";
import dgram from "dgram";

import { Certificate as x509Certificate } from "@fidm/x509";
import { HazelReader, HazelWriter } from "@skeldjs/util";

import { AesGcmRecordProtection, expandSecret } from "./AesGcmRecordProtection";
import { CipherSuite } from "./enums/CipherSuite";
import { HandshakeState } from "./enums/HandshakeState";
import { X25519EcdheRsaSha256 } from "./X25519EcdheRsaSha256";
import { RecordHeader } from "./RecordHeader";
import { ContentType } from "./enums/ContentType";
import { Handshake } from "./Handshake";
import { HandshakeType } from "./enums/HandshakeType";
import { HelloVerifyRequest } from "./HelloVerifyRequest";
import { ServerHello } from "./ServerHello";
import { Certificate } from "./Certificate";
import { ClientHello, EllipticCurvesExtension } from "./ClientHello";
import { NamedCurve } from "./enums/NamedCurve";
import { RecordProtection } from "./RecordProtection";
import { NullRecordProtection } from "./NullRecordProtection";
import { ChangeCipherSpec } from "./ChangeCipherSpec";
import { EventEmitter } from "stream";

export interface CurrentEpoch {
    nextOutgoingSequence: number;
    nextExpectedSequence: number;
    previousSequenceWindowBitmask: number;
    recordProtection: RecordProtection;
}

export interface FragmentRange {
    offset: number;
    length: number;
}

export interface NextEpoch {
    epoch: number;

    state: HandshakeState;

    nextOutgoingSequence: number;

    nextPacketResendTime: number;

    selectedCipherSuite: CipherSuite;
    recordProtection: RecordProtection;
    handshake?: X25519EcdheRsaSha256;
    cookie: Buffer;
    verificationStream: Buffer[];
    serverPublicKey?: Buffer;

    clientRandom: Buffer;
    serverRandom: Buffer;

    masterSecret: Buffer;
    serverVerification: Buffer;

    certificateFragments: FragmentRange[];
    certificatePayload: Buffer;
}

export interface DtlsSocket {
    emit(event: "message", data: Buffer): any;
    emit(event: "ready"): any;
    on(event: "message", listener: (data: Buffer) => any): any;
    on(event: "ready", listener: (data: Buffer) => any): any;
    once(event: "message", listener: (data: Buffer) => any): any;
    once(event: "ready", listener: (data: Buffer) => any): any;
    off(event: "message", listener: (data: Buffer) => any): any;
    off(event: "ready", listener: (data: Buffer) => any): any;
}

export class DtlsSocket extends EventEmitter {
    socket?: dgram.Socket;
    state: HandshakeState;

    epoch: number;
    currentEpoch: CurrentEpoch;
    nextEpoch: NextEpoch;
    handshakeResendTimeout = 200;

    queuedApplicationData: Buffer[];
    serverCertificates: x509Certificate[];

    constructor() {
        super();

        this.state = HandshakeState.Established;

        this.epoch = 0;

        this.currentEpoch = {
            nextOutgoingSequence: 1,
            nextExpectedSequence: 1,
            previousSequenceWindowBitmask: 0,
            recordProtection: new NullRecordProtection
        };

        this.nextEpoch = {
            epoch: 1,
            state: HandshakeState.Initializing,
            nextOutgoingSequence: 1,
            nextPacketResendTime: 0,
            selectedCipherSuite: CipherSuite.TLS_NULL_WITH_NULL_NULL,
            recordProtection: new NullRecordProtection,
            handshake: undefined,
            cookie: Buffer.alloc(0),
            verificationStream: [],
            serverPublicKey: undefined,
            clientRandom: Buffer.alloc(0),
            serverRandom: Buffer.alloc(0),
            masterSecret: Buffer.alloc(0),
            serverVerification: Buffer.alloc(0),
            certificateFragments: [],
            certificatePayload: Buffer.alloc(0)
        };

        this.queuedApplicationData = [];
        this.serverCertificates = [];
    }

    async connect(ip: string, port: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.socket) {
                this.socket.close();
            }

            this.socket = dgram.createSocket("udp4");

            this.socket.on("message", msg => {
                const reader = HazelReader.from(msg);
                this.handleRecv(reader);
            });

            try {
                this.socket.on("error", err => {
                    reject(err);
                });

                this.socket.on("connect", resolve);

                this.socket.connect(port, ip);
            } catch (e) {
                reject(e);
            }
        });
    }

    resetConnectionState() {
        this.state = HandshakeState.Established;

        this.epoch = 0;

        this.currentEpoch = {
            nextOutgoingSequence: 1,
            nextExpectedSequence: 1,
            previousSequenceWindowBitmask: 0,
            recordProtection: new NullRecordProtection
        };

        this.nextEpoch = {
            epoch: 1,
            state: HandshakeState.Initializing,
            nextOutgoingSequence: 1,
            nextPacketResendTime: 0,
            selectedCipherSuite: CipherSuite.TLS_NULL_WITH_NULL_NULL,
            recordProtection: new NullRecordProtection,
            handshake: undefined,
            cookie: Buffer.alloc(0),
            verificationStream: [],
            serverPublicKey: undefined,
            clientRandom: Buffer.alloc(32),
            serverRandom: Buffer.alloc(32),
            masterSecret: Buffer.alloc(32),
            serverVerification: Buffer.alloc(0),
            certificateFragments: [],
            certificatePayload: Buffer.alloc(0)
        };

        this.queuedApplicationData = [];
        this.serverCertificates = [];
    }

    setValidServerCertificates(certificates: x509Certificate[]) {
        this.serverCertificates.push(...certificates);
    }

    restartConnection() {
        this.resetConnectionState();
        crypto.randomFillSync(this.nextEpoch.clientRandom, 0);
        this.sendClientHello();

        // todo: https://github.com/willardf/Hazel-Networking/blob/2a4a13eeb77b969743d656e114cd2de6479499e6/Hazel/Dtls/DtlsUnityConnection.cs#L205
    }

    resendPacketsIfNeeded() {
        if (this.nextEpoch.state !== HandshakeState.Established) {
            const now = Date.now();
            if (now >= this.nextEpoch.nextPacketResendTime) {
                switch (this.nextEpoch.state) {
                    case HandshakeState.ExpectingServerHello:
                    case HandshakeState.ExpectingCertificate:
                    case HandshakeState.ExpectingServerKeyExchange:
                    case HandshakeState.ExpectingServerHelloDone:
                        this.sendClientHello();
                        break;
                    case HandshakeState.ExpectingChangeCipherSpec:
                    case HandshakeState.ExpectingFinished:
                        this.sendClientKeyExchangeFlight(true);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    flushQueuedApplicationData() {
        for (const queuedData of this.queuedApplicationData) {
            const outgoingRecord = new RecordHeader(
                ContentType.ApplicationData,
                this.epoch,
                this.currentEpoch.nextOutgoingSequence,
                this.currentEpoch.recordProtection!.getEncryptedSize(queuedData.byteLength)
            );
            this.currentEpoch.nextOutgoingSequence++;

            const packet = HazelWriter.alloc(RecordHeader.size + outgoingRecord.length);
            packet.write(outgoingRecord);

            const output = this.currentEpoch.recordProtection!.encryptClientPlaintext(
                queuedData,
                outgoingRecord
            );
            packet.bytes(output);
            this.socket?.send(packet.buffer);
        }
        this.queuedApplicationData = [];
    }

    private createWireData(bytes: Buffer) {
        if (this.nextEpoch.state !== HandshakeState.Established) {
            const copy = Buffer.from(bytes);
            this.queuedApplicationData.push(copy);
            return Buffer.alloc(0);
        }

        this.flushQueuedApplicationData();

        const outgoingRecord = new RecordHeader(
            ContentType.ApplicationData,
            this.epoch,
            this.currentEpoch.nextOutgoingSequence,
            this.currentEpoch.recordProtection!.getEncryptedSize(bytes.byteLength)
        );
        this.currentEpoch.nextOutgoingSequence++;

        const packet = HazelWriter.alloc(RecordHeader.size + outgoingRecord.length);
        packet.write(outgoingRecord);
        packet.bytes(bytes);

        const output = this.currentEpoch.recordProtection!.encryptClientPlaintext(
            packet.buffer.slice(RecordHeader.size, RecordHeader.size + bytes.byteLength),
            outgoingRecord
        );

        output.copy(packet.buffer, RecordHeader.size);
        return packet.buffer;
    }

    send(bytes: Buffer) {
        const wireData = this.createWireData(bytes);
        if (wireData.byteLength) {
            this.socket?.send(wireData);
        }
    }

    handleRecv(reader: HazelReader) {
        while (reader.left) {
            const record = reader.read(RecordHeader);
            const payloadReader = reader.bytes(record.length);

            if (record.contentType === ContentType.ApplicationData && this.nextEpoch.state !== HandshakeState.Established) {
                continue;
            }

            if (record.epoch !== this.epoch) {
                continue;
            }

            const windowIdx = this.currentEpoch.nextExpectedSequence - record.sequenceNumber - 1;
            const windowMask = 1 << windowIdx;
            if (record.sequenceNumber < this.currentEpoch.nextExpectedSequence) {
                if (windowIdx >= 64) {
                    continue;
                }

                if ((this.currentEpoch.previousSequenceWindowBitmask & windowMask) !== 0) {
                    continue;
                }
            }

            const decryptedPayload = this.currentEpoch.recordProtection.decryptCiphertextFromServer(payloadReader.buffer, record);

            if (!decryptedPayload) {
                return;
            }

            if (record.sequenceNumber >= this.currentEpoch.nextExpectedSequence) {
                const windowShift = record.sequenceNumber + 1 - this.currentEpoch.nextExpectedSequence;
                this.currentEpoch.previousSequenceWindowBitmask <<= windowShift;
                this.currentEpoch.nextExpectedSequence = record.sequenceNumber + 1;
            } else {
                this.currentEpoch.previousSequenceWindowBitmask |= windowMask;
            }

            const decryptedReader = HazelReader.from(decryptedPayload);
            this.handlePayload(record, decryptedReader);
        }
    }

    private handlePayload(record: RecordHeader, reader: HazelReader) {
        switch (record.contentType) {
            case ContentType.ChangeCipherSpec:
                if (this.nextEpoch.state !== HandshakeState.ExpectingChangeCipherSpec) {
                    return;
                }
                this.epoch = this.nextEpoch.epoch;
                this.currentEpoch.recordProtection = this.nextEpoch.recordProtection;
                this.currentEpoch.nextOutgoingSequence = this.nextEpoch.nextOutgoingSequence;
                this.currentEpoch.nextExpectedSequence = 1;
                this.currentEpoch.previousSequenceWindowBitmask = 0;

                this.nextEpoch.state = HandshakeState.ExpectingFinished;
                this.nextEpoch.selectedCipherSuite = CipherSuite.TLS_NULL_WITH_NULL_NULL;
                this.nextEpoch.recordProtection = new NullRecordProtection;
                this.nextEpoch.handshake = undefined;
                this.nextEpoch.cookie = Buffer.alloc(0);
                this.nextEpoch.verificationStream = [];
                this.nextEpoch.serverPublicKey = undefined;
                this.nextEpoch.serverRandom = Buffer.alloc(32);
                this.nextEpoch.clientRandom = Buffer.alloc(32);
                this.nextEpoch.masterSecret = Buffer.alloc(48);
                this.emit("ready");
                break;
            case ContentType.Alert:
                break;
            case ContentType.Handshake:
                this.handleHandshake(record, reader);
                break;
            case ContentType.ApplicationData:
                this.emit("message", reader.buffer);
                break;
        }
    }

    private handleHandshake(record: RecordHeader, reader: HazelReader) {
        while (reader.left) {
            const startOfHandshake = reader.cursor;
            const handshake = reader.read(Handshake);
            let payloadReader = reader.bytes(handshake.length);

            if (handshake.messageType !== HandshakeType.Certificate && (handshake.fragmentOffset !== 0 || handshake.fragmentLength !== handshake.length)) {
                continue;
            }

            switch (handshake.messageType) {
                case HandshakeType.HelloVerifyRequest:
                    if (this.nextEpoch.state !== HandshakeState.ExpectingServerHello) {
                        continue;
                    }

                    const helloVerifyRequest = payloadReader.read(HelloVerifyRequest);
                    this.nextEpoch.cookie = Buffer.alloc(helloVerifyRequest.cookie.byteLength);
                    helloVerifyRequest.cookie.copy(this.nextEpoch.cookie);

                    crypto.randomFillSync(this.nextEpoch.clientRandom);
                    this.sendClientHello();
                    break;
                case HandshakeType.ServerHello:
                    if (this.nextEpoch.state !== HandshakeState.ExpectingServerHello) {
                        continue;
                    } else if (handshake.messageSequence !== 1) {
                        continue;
                    }

                    const serverHello = payloadReader.read(ServerHello);

                    let selectedCipherSuite = CipherSuite.TLS_NULL_WITH_NULL_NULL;
                    for (const cipherSuite of serverHello.cipherSuites) {
                        switch (cipherSuite) {
                            case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:
                                this.nextEpoch.handshake = new X25519EcdheRsaSha256;
                                selectedCipherSuite = cipherSuite;
                                break;
                        }

                        if (selectedCipherSuite !== CipherSuite.TLS_NULL_WITH_NULL_NULL)
                            break;
                    }

                    this.nextEpoch.selectedCipherSuite = selectedCipherSuite;
                    serverHello.random.copy(this.nextEpoch.serverRandom);
                    this.nextEpoch.state = HandshakeState.ExpectingCertificate;
                    this.nextEpoch.certificateFragments = [];
                    this.nextEpoch.certificatePayload = Buffer.alloc(0);

                    this.nextEpoch.verificationStream.push(reader.buffer.slice(startOfHandshake, startOfHandshake + 12 + handshake.length));
                    break;
                case HandshakeType.Certificate:
                    if (this.nextEpoch.state !== HandshakeState.ExpectingCertificate) {
                        continue;
                    } else if (handshake.messageSequence !== 2) {
                        continue;
                    }

                    if (handshake.fragmentLength !== handshake.length) {
                        if (this.nextEpoch.certificatePayload.length !== handshake.length) {
                            this.nextEpoch.certificatePayload = Buffer.alloc(handshake.length);
                            this.nextEpoch.certificateFragments = [];
                        }
                        payloadReader.buffer.copy(this.nextEpoch.certificatePayload, handshake.fragmentOffset, 0, handshake.fragmentLength);
                        this.nextEpoch.certificateFragments.push({
                            offset: handshake.fragmentOffset,
                            length: handshake.fragmentLength
                        });
                        this.nextEpoch.certificateFragments.sort((a, b) => {
                            return a.offset - b.offset;
                        });

                        let currentOffset = 0;
                        let valid = false;
                        for (const fragmentRange of this.nextEpoch.certificateFragments) {
                            if (fragmentRange.offset !== currentOffset) {
                                valid = false;
                                break;
                            }
                            currentOffset += fragmentRange.length;
                        }
                        if (currentOffset !== this.nextEpoch.certificatePayload.length) {
                            valid = false;
                        }
                        if (!valid) {
                            continue;
                        }
                        this.nextEpoch.certificateFragments = [];
                        payloadReader = HazelReader.from(this.nextEpoch.certificatePayload);
                    }

                    const certificate = payloadReader.read(Certificate).certificates[0];

                    // todo: check if this.serverCertificates has this certificate.

                    if (certificate.publicKey.algo !== "rsaEncryption")
                        continue;

                    const fullCertificateHandshake = new Handshake(
                        handshake.messageType,
                        handshake.length,
                        handshake.messageSequence,
                        0,
                        handshake.length
                    );

                    const serializedCertificateHandshake = HazelWriter.alloc(12);
                    serializedCertificateHandshake.write(fullCertificateHandshake);
                    this.nextEpoch.verificationStream.push(serializedCertificateHandshake.buffer);
                    this.nextEpoch.verificationStream.push(payloadReader.buffer);

                    this.nextEpoch.serverPublicKey = certificate.publicKey.keyRaw;
                    this.nextEpoch.state = HandshakeState.ExpectingServerKeyExchange;
                    break;
                case HandshakeType.ServerKeyExchange:
                    if (this.nextEpoch.state !== HandshakeState.ExpectingServerKeyExchange) {
                        continue;
                    } else if (!this.nextEpoch.serverPublicKey) {
                        continue;
                    } else if (!this.nextEpoch.handshake) {
                        continue;
                    } else if (handshake.messageSequence !== 3) {
                        continue;
                    }

                    const sharedSecret = this.nextEpoch.handshake.verifyServerMessageAndGenerateSharedKey(payloadReader.buffer.slice(payloadReader.cursor), this.nextEpoch.serverPublicKey);
                    if (!sharedSecret) {
                        continue;
                    }

                    const randomSeed = Buffer.alloc(64);
                    this.nextEpoch.clientRandom.copy(randomSeed);
                    this.nextEpoch.serverRandom.copy(randomSeed, this.nextEpoch.clientRandom.byteLength);

                    const masterSecretSize = 48;
                    const masterSecret = Buffer.alloc(masterSecretSize);
                    expandSecret(masterSecret, sharedSecret, "master secert", randomSeed);

                    switch (this.nextEpoch.selectedCipherSuite) {
                        case CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:
                            this.nextEpoch.recordProtection = new AesGcmRecordProtection(
                                masterSecret,
                                this.nextEpoch.serverRandom,
                                this.nextEpoch.clientRandom
                            );
                            break;
                    }

                    this.nextEpoch.state = HandshakeState.ExpectingServerHelloDone;
                    this.nextEpoch.masterSecret = masterSecret;

                    this.nextEpoch.verificationStream.push(reader.buffer.slice(startOfHandshake, startOfHandshake + 12 + handshake.length));
                    break;
                case HandshakeType.ServerHelloDone:
                    if (this.nextEpoch.state !== HandshakeState.ExpectingServerHelloDone) {
                        continue;
                    } else if (handshake.messageSequence !== 4) {
                        continue;
                    }

                    this.nextEpoch.state = HandshakeState.ExpectingChangeCipherSpec;
                    this.nextEpoch.verificationStream.push(reader.buffer.slice(startOfHandshake, startOfHandshake + 12 + handshake.length));

                    this.sendClientKeyExchangeFlight(false);
                    break;
                case HandshakeType.Finished:
                    if (this.nextEpoch.state !== HandshakeState.ExpectingFinished) {
                        continue;
                    } else if (handshake.messageSequence !== 7) {
                        continue;
                    }

                    if (Buffer.compare(reader.buffer, this.nextEpoch.serverVerification) !== 1) {
                        continue;
                    }

                    this.nextEpoch.epoch++;
                    this.nextEpoch.state = HandshakeState.Established;
                    this.nextEpoch.nextPacketResendTime = 0;
                    this.nextEpoch.serverVerification = Buffer.alloc(0);
                    this.nextEpoch.masterSecret = Buffer.alloc(32);

                    this.flushQueuedApplicationData();
                    break;
            }
        }
    }

    sendClientHello() {
        this.nextEpoch.verificationStream = [];

        const clientHello = new ClientHello(
            this.nextEpoch.clientRandom,
            this.nextEpoch.cookie,
            [ CipherSuite.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 ],
            [
                new EllipticCurvesExtension([ NamedCurve.x25519 ])
            ]
        );

        const clientHelloWriter = HazelWriter.alloc(0);
        clientHelloWriter.write(clientHello);

        const handshake = new Handshake(
            HandshakeType.ClientHello,
            clientHelloWriter.size,
            0,
            0,
            clientHelloWriter.size
        );

        const plaintextLen = 12 + handshake.length;
        const outgoingRecord = new RecordHeader(
            ContentType.Handshake,
            this.epoch,
            this.currentEpoch.nextOutgoingSequence,
            this.currentEpoch.recordProtection.getEncryptedSize(plaintextLen)
        );
        this.currentEpoch.nextOutgoingSequence++;

        const packet = HazelWriter.alloc(RecordHeader.size + outgoingRecord.length);
        packet.write(outgoingRecord);
        packet.write(handshake);
        packet.bytes(clientHelloWriter.buffer);

        this.nextEpoch.verificationStream.push(packet.buffer.slice(RecordHeader.size, RecordHeader.size + 12 + handshake.length));

        const output = this.currentEpoch.recordProtection!.encryptClientPlaintext(
            packet.buffer.slice(RecordHeader.size, RecordHeader.size + plaintextLen),
            outgoingRecord
        );
        output.copy(packet.buffer, RecordHeader.size);

        this.nextEpoch.state = HandshakeState.ExpectingServerHello;
        this.nextEpoch.nextPacketResendTime = Date.now() + this.handshakeResendTimeout;

        this.socket?.send(packet.buffer);
    }

    sendClientKeyExchangeFlight(isRetrasmit: boolean) {
        const msgSize = 33;

        const keyExchangeHandshake = new Handshake(
            HandshakeType.ClientKeyExchange,
            msgSize,
            5,
            0,
            msgSize
        );

        const keyExchangeRecord = new RecordHeader(
            ContentType.Handshake,
            this.epoch,
            this.currentEpoch.nextOutgoingSequence,
            this.currentEpoch.recordProtection!.getEncryptedSize(12 + msgSize)
        );
        this.currentEpoch.nextOutgoingSequence++;

        const changeCipherSpecRecord = new RecordHeader(
            ContentType.ChangeCipherSpec,
            this.epoch,
            this.currentEpoch.nextOutgoingSequence,
            this.currentEpoch.recordProtection!.getEncryptedSize(1)
        );
        this.currentEpoch.nextOutgoingSequence++;

        const finishedHandshake = new Handshake(
            HandshakeType.Finished,
            12,
            6,
            0,
            12
        );

        const finishedRecord = new RecordHeader(
            ContentType.Handshake,
            this.nextEpoch.epoch,
            this.nextEpoch.nextOutgoingSequence,
            this.nextEpoch.recordProtection!.getEncryptedSize(12 + 12)
        );
        this.nextEpoch.nextOutgoingSequence++;

        const packetLen = 0 +
            RecordHeader.size + keyExchangeRecord.length +
            RecordHeader.size + changeCipherSpecRecord.length +
            RecordHeader.size + finishedRecord.length;

        const writer = HazelWriter.alloc(packetLen);
        writer.write(keyExchangeRecord);
        writer.write(keyExchangeHandshake);
        const keyExchangeEncode = Buffer.alloc(33);
        this.nextEpoch.handshake?.encodeClientKeyExchangeMessage(keyExchangeEncode);
        writer.bytes(keyExchangeEncode);

        const startOfChangeCipherSpecRecord = writer.cursor;
        writer.write(changeCipherSpecRecord);
        writer.write(ChangeCipherSpec);

        const startOfFinishedRecord = writer.cursor;
        writer.write(finishedRecord);
        writer.write(finishedHandshake);

        if (!isRetrasmit) {
            this.nextEpoch.verificationStream.push(
                writer.buffer.slice(RecordHeader.size, RecordHeader.size + 12 + keyExchangeHandshake.length)
            );
        }

        const handshakeHash = crypto.createHash("sha256").update(Buffer.concat(this.nextEpoch.verificationStream)).digest();
        expandSecret(this.nextEpoch.serverVerification, this.nextEpoch.masterSecret, "server finished", handshakeHash);
        const expandKeyOutput = Buffer.alloc(12);
        expandSecret(expandKeyOutput, this.nextEpoch.masterSecret, "client finished", handshakeHash);
        writer.bytes(expandKeyOutput);

        const keyExchangeEncrypt = this.currentEpoch.recordProtection.encryptClientPlaintext(
            writer.buffer.slice(RecordHeader.size, RecordHeader.size + keyExchangeHandshake.length),
            keyExchangeRecord
        );
        keyExchangeEncrypt.copy(writer.buffer, RecordHeader.size, 0, keyExchangeEncrypt.byteLength);

        const changeCipherSpecEncrypt = this.currentEpoch.recordProtection!.encryptClientPlaintext(
            writer.buffer.slice(startOfChangeCipherSpecRecord + RecordHeader.size, startOfChangeCipherSpecRecord + RecordHeader.size + 1),
            changeCipherSpecRecord
        );
        changeCipherSpecEncrypt.copy(writer.buffer, startOfChangeCipherSpecRecord + RecordHeader.size);

        const finishedEncrypt = this.nextEpoch.recordProtection!.encryptClientPlaintext(
            writer.buffer.slice(startOfFinishedRecord + RecordHeader.size, startOfFinishedRecord + RecordHeader.size + 12 + finishedHandshake.length),
            finishedRecord
        );
        finishedEncrypt.copy(writer.buffer, startOfFinishedRecord + RecordHeader.size);

        this.nextEpoch.state = HandshakeState.ExpectingChangeCipherSpec;
        this.nextEpoch.nextPacketResendTime = Date.now() + this.handshakeResendTimeout;
        this.socket?.send(writer.buffer);
    }
}
