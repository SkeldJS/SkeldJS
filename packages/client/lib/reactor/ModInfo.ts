import { PluginSide } from "./packets/ReactorModDeclaration";

export class ModInfo {
    id: string;
    version: string;
    side: PluginSide;

    constructor(
        id: string,
        version: string,
        side = PluginSide.Both
    ) {
        this.id = id;
        this.version = version;
        this.side = side;
    }
}
