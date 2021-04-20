import { Int2Code, sleep } from "@skeldjs/util";
import * as text from "@skeldjs/text";
import * as skeldjs from "..";

const tb = text.tb;

const regcode = process.argv[2];

if (regcode !== "EU" && regcode !== "NA" && regcode !== "AS") {
    console.log(
        "Region must be either EU (Europe), NA (North America) or AS (Asia)."
    );
} else {
    (async () => {
        const client = new skeldjs.SkeldjsClient("2021.4.2.0");

        console.log("Connecting to server..");
        await client.connect(regcode, "weakeyes", 4324);

        console.log("Creating game..");
        const code = await client.createGame({
            players: 10,
            map: skeldjs.MapID.Airship,
            impostors: 2,
        });

        const boardWidth = 35;
        const boardHeight = 15;

        const paddleHeight = 5;

        let paddle1 = 0;
        let paddle2 = 5;
        let x = 5;
        let y = 5;
        let dx = 1;
        let dy = 1;

        let turn = 1;

        function reRender() {
            x += dx;
            y += dy;

            if (y < 1 || y > boardHeight - 2) {
                dy = -dy;
            }

            if (x < 2 || x > boardWidth - 1) {
                dx = -dx;
                if (x < 2) {
                    turn = 1;
                } else if (x > boardWidth - 1) {
                    turn = 0;
                }
            }

            const mid = y - 2;

            if (turn) {
                if (paddle2 > mid) {
                    paddle2--;
                } else if (paddle2 < mid) {
                    paddle2++;
                }
            } else {
                if (paddle1 > mid) {
                    paddle1--;
                } else if (paddle1 < mid) {
                    paddle1++;
                }
            }

            paddle1 = Math.max(
                0,
                Math.min(paddle1, boardHeight - paddleHeight)
            );
            paddle2 = Math.max(
                0,
                Math.min(paddle2, boardHeight - paddleHeight)
            );

            return new Array(boardHeight)
                .fill(0)
                .map((_, line) => {
                    let ln = "";
                    if (line < paddle1 + paddleHeight && line >= paddle1) {
                        ln += "<alpha=#FF><mark=#00ff00ff>O</mark>";
                        ln += "<alpha=#00>";
                    } else {
                        ln += "<alpha=#00>";
                        ln += "O";
                    }
                    if (y === line) {
                        ln += "O".repeat(x - 1);
                        ln += "<alpha=#FF><mark=#ffff00ff>O</mark>";
                        ln += "<alpha=#00>";
                        ln += "O".repeat(boardWidth - x);
                    } else {
                        ln += "O".repeat(boardWidth);
                    }
                    if (line < paddle2 + paddleHeight && line >= paddle2) {
                        ln += "<alpha=#FF><mark=#00ff00ff>O</mark>";
                    } else {
                        ln += "O";
                    }
                    return ln;
                })
                .join("\r\n");
        }

        setInterval(() => {
            client.me.control.setName(
                tb()
                    .text("Pong Moment\r\n")
                    .align(
                        text.Align.Left,
                        tb().size("35%", tb().text(reRender(), true))
                    )
                    .toString()
            );
        }, 50);

        client.me.control.setColor(skeldjs.ColorID.Purple);

        client.on("player.join", () => {
            console.log("player joined.");
            (async () => {
                await sleep(1500);
                client.me.control.chat("Hello");
            })();
        });

        console.log(
            "Created game @ " + Int2Code(code) + " on " + regcode + " servers."
        );
    })();
}
