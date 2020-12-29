const games = {};

export class MovingCodePlugin extends SkeldJSPlugin {
    constructor(server, options) {
        super(server, options);
    }

    onCreateRoom(evt, client, room) {
        const chars = room.code.id.split("");

        setInterval(() => {
            chars.push(chars.shift());

            room.code.set(chars.join(""));
        }, 500);
    }
}