import { DtlsSocket } from "./lib";

(async () => {
    const socket = new DtlsSocket;

    await socket.connect(22626, "127.0.0.1");
})();
