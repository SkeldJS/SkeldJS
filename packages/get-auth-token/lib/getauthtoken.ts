import path from "path";
import child_process from "child_process";

import { SkeldjsClient } from "@skeldjs/client";
import { sleep } from "@skeldjs/util";

export interface GetAuthTokenOptions {
    /**
     * Absolute path to the GetAuthToken executable.
     */
    exe_path: string;
    /**
     * Absolute path to the certificate to use.
     */
    cert_path: string;
    /**
     * The maximum number of attempts to get an auth token.
     */
    attempts?: number;
}

function getAuthTokenImpl(
    exe_path: string,
    cert_path: string,
    ip: string,
    port: number
): Promise<number> {
    return new Promise((resolve, reject) => {
        const tokenRegExp = /TOKEN:(\d+):TOKEN/;

        const args = [
            path.resolve(process.cwd(), cert_path),
            ip,
            port.toString(),
        ];

        const proc = child_process.spawn(exe_path, args);

        proc.stdout.on("data", (chunk) => {
            const out = chunk.toString("utf8");
            const matched = tokenRegExp.exec(out.toString("utf8"));

            if (matched) {
                const foundToken = matched[1];

                const authToken = parseInt(foundToken);
                proc.kill("SIGINT");
                resolve(authToken);
            }
        });

        proc.on("error", (err) => {
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
 * Get an authentication token from a specified server.
 * @param exe_path The path to the GetAuthToken executable.
 * @param cert_path The path to the certificate to use.
 * @param ip The IP of the server to get a token from.
 * @param port The port of the server to get a token from.
 * @param attempts The maximum number of attempts to get an auth token, before throwing an error.
 * @example
 * ```ts
 * const token = await getAuthToken(
 *   "path_to_get_auth_token.exe",
 *   "path_to_cert_path",
 *   "127.0.0.1",
 *   22025
 * )
 * ```
 */
export async function getAuthToken(
    exe_path: string,
    cert_path: string,
    ip: string,
    port: number,
    attempts = 1,
    attempt = 1
): Promise<number> {
    try {
        return await getAuthTokenImpl(exe_path, cert_path, ip, port);
    } catch (e) {
        if (attempt === attempts) {
            throw e;
        } else {
            return await getAuthToken(
                exe_path,
                cert_path,
                ip,
                port,
                attempts,
                attempt + 1
            );
        }
    }
}

/**
 * Hook a skeldjs client to automatically get an authentication token before connecting to a server.
 * @param client The client to hook.
 * @param options Options for get auth token.
 * @example
 * ```ts
 * const client = new SkeldjsClient("2021.4.2");
 *
 * authTokenHook(client, {
 *   exe_path: "path_to_get_auth_token.exe",
 *   cert_path: "path_to_cert_path"
 * });
 * ```
 */
export function authTokenHook(
    client: SkeldjsClient,
    options: GetAuthTokenOptions
) {
    client.on("client.connect", async (ev) => {
        try {
            client.token = await getAuthToken(
                options.exe_path,
                options.cert_path,
                ev.ip,
                ev.port + 2 /* Auth port is normal port + 2 */,
                options.attempts ?? 1
            );
        } catch (e) {
            client.token = 0;
        }
    });
}
