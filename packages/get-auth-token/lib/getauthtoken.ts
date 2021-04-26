import path from "path";
import child_process from "child_process";

import { SkeldjsClient } from "@skeldjs/client";
import { sleep } from "@skeldjs/util";

export interface GetAuthTokenOptions {
    /**
     * The path to the GetAuthToken executable.
     */
    exe_path: string;
    /**
     * The path to the certificate to use.
     */
    cert_path: string;
}

/**
 * Get an authentication token from a specified server.
 * @param exe_path The path to the GetAuthToken executable.
 * @param cert_path The path to the certificate to use.
 * @param ip The IP of the server to get a token from.
 * @param port The port of the server to get a token from.
 */
export function getAuthToken(exe_path: string, cert_path: string, ip: string, port: number): Promise<number> {
    return new Promise((resolve, reject) => {
        const tokenRegExp = /TOKEN:(\d+):TOKEN/;

        const args = [
            path.resolve(process.cwd(), cert_path),
            ip,
            port.toString()
        ];

        const proc = child_process.spawn(exe_path, args);

        proc.stdout.on("data", chunk => {
            const out = chunk.toString("utf8");
            const matched = tokenRegExp.exec(out.toString("utf8"));

            if (matched) {
                const foundToken = matched[1];

                const authToken = parseInt(foundToken);
                proc.kill("SIGINT");
                resolve(authToken);
            }
        });

        proc.on("error", err => {
            proc.kill("SIGINT");
            reject(err);
        });

        sleep(5000).then(() => {
            proc.kill("SIGINT");
            reject(new Error("GetAuthToken took too long to get a token."));
        });
    });
}

/**
 * Hook a skeldjs client to automatically get an authentication token before connecting to a server.
 * @param client The client to hook.
 * @param options Options for get auth token.
 */
export function authTokenHook(client: SkeldjsClient, options: GetAuthTokenOptions) {
    client.on("client.connect", async ev => {
        const { ip, port } = ev.data;
        try {
            client.token = await getAuthToken(options.exe_path, options.cert_path, ip, port + 2 /* Auth port is normal port + 2 */);
        } catch (e) {
            client.token = 0;
        }
    });
}
