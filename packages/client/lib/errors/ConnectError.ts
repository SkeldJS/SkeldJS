export class ConnectError extends Error {
    constructor(
        public readonly reason: number,
        public readonly message: string
    ) {
        super("Connect error: Failed to connect to server, code: " + reason + " (Message: " + message + ")");
    }
}
