import gifFrames from "gif-frames";
import imgpix from "image-pixels";
import fs from "fs";

import { Int2Code, sleep } from "@skeldjs/util";
import * as text from "@skeldjs/text";
import * as skeldjs from "..";

const tb = text.tb;

function write(filename: string, image: any): Promise<void> {
    return new Promise((resolve) => {
        const stream = fs.createWriteStream(filename);
        image.pipe(stream);

        stream.on("close", () => {
            resolve();
        });
    });
}

type RGBA = [number, number, number, number];

function hexb(byte: number) {
    if (!byte) return "00";

    return byte.toString(16).padStart(2, "0");
}

function hex(rgba: RGBA) {
    return hexb(rgba[0]) + hexb(rgba[1]) + hexb(rgba[2]) + hexb(rgba[3]);
}

function same(a: RGBA, b: RGBA) {
    if (!a || !b) return false;

    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function createTextImage(
    data: number[],
    width: number,
    height: number,
    resx: number,
    resy: number
) {
    const res: RGBA[][] = [];

    for (let y = 0; y < resy; y++) {
        const ln = [];
        for (let x = 0; x < resx; x++) {
            const acx = x * (width / resx);
            const acy = y * (height / resy);
            const pos = (acy * height + acx) * 4;

            ln.push([data[pos], data[pos + 1], data[pos + 2], data[pos + 3]]);
        }
        res.push(ln);
    }

    let last: RGBA = null;
    return res
        .map((ln) => {
            let out = "";
            for (let i = 0; i < ln.length; i++) {
                const px = ln[i];

                if (same(px, last)) {
                    out += "OO";
                } else {
                    if (i > 0) {
                        out += "</mark>";
                    }
                    out += "<mark=#" + hex(px) + ">OO";
                }
                last = px;
            }
            return out;
        })
        .join("\r\n");
}

const regcode = process.argv[2];
if (regcode !== "EU" && regcode !== "NA" && regcode !== "AS") {
    console.log(
        "Region must be either EU (Europe), NA (North America) or AS (Asia)."
    );
} else {
    (async () => {
        const frames = await gifFrames({
            url: fs.readFileSync(process.argv[3]),
            frames: "all",
        });
        const files = [];

        try {
            fs.mkdirSync("./frames");
        } catch (e) {
            void e;
        }

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const filename = "./frames/frame" + i + ".png";

            await write(filename, frame.getImage());
            files.push(filename);
        }

        const client = new skeldjs.SkeldjsClient("2021.4.2.0");

        console.log("Connecting to server..");
        await client.connect(regcode, "weakeyes", 4324);

        console.log("Creating game..");
        const code = await client.createGame({
            players: 10,
            map: skeldjs.MapID.TheSkeld,
            impostors: 2,
        });

        console.log(
            "Created game @ " +
                Int2Code(code as number) +
                " on " +
                regcode +
                " servers."
        );

        const resx = parseInt(process.argv[4]);
        const resy = parseInt(process.argv[5]);
        console.log("Running gif @ " + resx + "x" + resy);

        // eslint-disable-next-line no-constant-condition
        while (true) {
            for (const filename of files) {
                const { data, width, height } = await imgpix(filename);

                const txt = await createTextImage(
                    data,
                    width,
                    height,
                    resx,
                    resy
                );
                client.me.control.setName(
                    tb()
                        .text("weakeyes\r\n")
                        .align(
                            text.Align.Left,
                            tb().size("35%", tb().text(txt, true))
                        )
                        .toString()
                );
                await sleep(50);
            }
        }
    })();
}
