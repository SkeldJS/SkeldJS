export class JoinError extends Error {
    constructor(
        public readonly reason: number,
        public readonly message: string
    ) {
        super("Join error: Failed to join game, code: " + reason + " (Message: " + message + ")");
    }
}