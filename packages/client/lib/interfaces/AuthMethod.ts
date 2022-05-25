export enum AuthMethod {
    /**
     * Don't authenticate with the server and just attempt to join/create/find a game
     * immediately.
     */
    None,
    /**
     * Create a separate, secure DTLS connection to a different server before joining,
     * serving short nonce tokens that can be used to authenticate.
     */
    NonceExchange,
    /**
     * Use a secure transport for all connections to the game server.
     */
    SecureTransport
}
