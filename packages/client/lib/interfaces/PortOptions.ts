export interface PortOptions {
    /**
     * The port number of the insecure game server
     * @default 22023
     */
    insecureGameServer: number;
    /**
     * The port number of the secure game server
     * @default insecureGameServer + 3
     */
    secureGameServer: number;
    /**
     * The port number of the authentication server.
     * @default secureGameServer + 2
     */
    authServer: number;
    /**
     * The port number of the http matchamekr server.
     * @default insecureGameServer - 2
     */
    httpMatchmaker: number;
}
