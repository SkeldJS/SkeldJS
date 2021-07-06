export enum HandshakeState {
    Established,
    ExpectingServerHello,
    ExpectingCertificate,
    ExpectingServerKeyExchange,
    ExpectingServerHelloDone,
    ExpectingChangeCipherSpec,
    ExpectingFinished,
    Initializing
}
