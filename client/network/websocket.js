class Websocket {
    #connection = null;

    #callbacks = new Map();

    #connected = null;

    constructor() {
        // TODO: Move to detect environment.
        const websocketURL = `wss://${window.location.host}/ws`;

        console.log(`Connecting to Websocket @ ${websocketURL}`);

        let resolved = false;

        this.#connected = new Promise((res, rej) => {
            this.#connection = new WebSocket(websocketURL);

            this.#connection.onopen = (ev) => {
                console.log('Websocket connected.');

                if (!resolved) {
                    resolved = true;
                    res(`Websocket Open`);
                }
            };

            this.#connection.onerror = (ev) => {
                console.log('Error with Websocket.');
                console.error(ev);

                if (!resolved) {
                    resolved = true;
                    rej(`Websocket Errored`);
                }
            };

            this.#connection.onclose = (ev) => {
                console.log('Websocket closed.');

                this.#connection = null;

                if (!resolved) {
                    resolved = true;
                    rej(`Websocket Closed`);
                }
            };

            this.#connection.onmessage = (ev) => {
                this.#callbacks.forEach((cb) => {
                    cb(JSON.parse(ev.data));
                });
            };
        });
    }

    onMessage = (cb) => {
        this.#callbacks.set(cb, cb);

        return () => {
            this.#callbacks.delete(cb);
        };
    }

    send = async (data) => {
        try {
            await this.#connected;

            if (this.#connection) {
                this.#connection.send(JSON.stringify(data));
            } else {
                throw new Error(`Failed to send as connection no longer exists.`);
            }
        } catch (e) {
            console.log('Failed to send data to Websocket.');
            console.error(e);
        }
    }
}

const websocket = new Websocket();

export default websocket;
