export abstract class SkeldjsDummyClient {
    constructor() {

    }

    connect(server: SkeldjsDummyServer) {

    }

    join(code: string) {

    }
}

export abstract class SkeldjsDummyServer {
    constructor() {

    }
}

export abstract class SkeldjsPlugin {
    constructor(private server: SkeldjsDummyServer) {

    }
}
