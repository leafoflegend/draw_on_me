class EventEmitter {
    #subscribers = new Map();

    emit = (type, data) => {
        const callbackMap = this.#subscribers.get(type);

        if (callbackMap) {
            callbackMap.forEach((cb) => {
                cb(data);
            });
        }
    };

    subscribe = (type, cb) => {
        if (!this.#subscribers.get(type)) {
            this.#subscribers.set(type, new Map());
        }

        const callbackMap = this.#subscribers.get(type);

        callbackMap.set(cb, cb);

        return () => {
            const callbackMap = this.#subscribers.get(type);

            callbackMap.delete(cb);
        };
    };
}

const ee = new EventEmitter();

export default ee;
