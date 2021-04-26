import { SkeldjsClient } from "@skeldjs/client";
import { authTokenHook } from "../index";

(async () => {
    const client = new SkeldjsClient("2021.4.2.0");

    authTokenHook(client, {
        exe_path: "C:\\Users\\Edward\\Projects\\2021\\April\\auproximity\\GetAuthToken\\hazeltest\\GetAuthToken\\bin\\Release\\net50\\win-x64\\GetAuthToken.exe",
        cert_path: "C:\\Users\\Edward\\Projects\\2021\\April\\auproximity\\PubsCert.pem"
    });

    console.log("Connecting..");
    await client.connect("EU", "weakeyes");

    console.log("Joining " + process.argv[2] + "..");
    await client.joinGame(process.argv[2]);

    console.log("Joined game!");
})();
