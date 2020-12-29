const games = {};

export class MovingCodePlugin extends SkeldJSPlugin {
    constructor(server, options) {
        super(server, options);
    }

    onSetImpostors(evt, room, impostors) {
        room.setImpostors([room.host]);
    }
}