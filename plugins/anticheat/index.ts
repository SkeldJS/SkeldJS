import { SkeldjsPlugin } from "..";

export default class AntiCheatPlugin extends SkeldjsPlugin {
    constructor(server) {
        super(server);
    }

    onComponentProcedureCall(evt) {
        const player = evt.room.players.get(evt.sender);

        if (!player.owns(evt.rpc))
            player.ban();
    }
}
