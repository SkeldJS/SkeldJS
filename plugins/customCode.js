const rooms = {};

export class CustomCodePlugin extends SkeldJSPlugin {
    constructor(server, options) {
        super(server, options);
    }

    onTryCreateRoom(evt, client, options) {
        evt.cancel();
        
        rooms[client.ip] = options;

        client.disconnect("Please enter the code you wish to have using the Join Game input below. Type 'CANCEL' to cancel creating a room.");
    }

    onTryJoinRoom(evt, client, code, found_room) {
        if (rooms[client.ip]) {
            evt.cancel();

            if (found_room) {
                client.disconnect("That room code is already taken, try another, or use 'CANCEL' to cancel creating a room.");
            } else {
                const room = new Room(this.server, code, rooms[client.ip]);

                client.join(room);
            }
        }
    }
}