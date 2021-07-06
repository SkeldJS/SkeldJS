export enum HandshakeType {
    HelloRequest,
    ClientHello,
    ServerHello,
    HelloVerifyRequest,
    Certificate = 11,
    ServerKeyExchange,
    CertificateRequest,
    ServerHelloDone,
    CertificateVerify,
    ClientKeyExchange,
    Finished = 20
}
