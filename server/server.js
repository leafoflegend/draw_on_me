import { WebSocketServer } from 'ws';
import express from 'express';
import chalk from 'chalk';
import { v4 } from 'uuid';
import eventEmitter from './event_emitter.js';
import { retrieve, store } from './cache.js';
import * as url from 'url';
import path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const PORT = process.env.PORT || 6969;
const ROOT_DIR = path.join(__dirname, '../');
const STATIC_DIR = path.join(ROOT_DIR, './dist');

console.log(chalk.cyan(`Static Directory: ${STATIC_DIR}`));

const socketMap = new Map();

const arts = [];

const app = express();

app.use(express.json());

app.use(express.static(STATIC_DIR));

app.post('/art', (req, res, next) => {
    let { color, points, thickness } = req.body;

    if (!color || !points || !thickness) {
        res.status(400).send({
            success: false,
            error: `You failed to include "color" and/or "points" and/or "thickness". All three are required to contribute art.`,
        });
        return;
    }

    if (typeof color !== 'string') {
        res.status(400).send({
            success: false,
            error: `"color" must be a string. You sent a: ${typeof color}`,
        });
        return;
    }

    if (!Array.isArray(points) || !points.every((p) => typeof p === 'number') || points.length % 2 === 1) {
        res.status(400).send({
            success: false,
            error: `"points" must be an array of x, y coordinates at which to plot your line. So it must be a series of numbers inside the array with a length divisible by 2.`,
        });
        return;
    }

    if (typeof thickness !== 'number') {
        res.status(400).send({
            success: false,
            error: `"thickness" must be a number representing width in pixels.`,
        });
        return;
    }

    if (thickness > 10) {
        thickness = 10;
    }

    const newArt = {
        color,
        thickness,
        points,
        id: v4(),
    };

    arts.push(newArt);

    eventEmitter.emit('art', newArt);
    res.status(200).send({
        success: true,
        message: `Your line art has been successfully added. It is the ${arts.length} piece of art added to our collection.`,
    });
});

app.get('/art', (req, res, next) => {
    console.log(chalk.cyan(`All Art Retrieved over HTTP API. Size: ${arts.length}. Time: ${new Date()}`));
    res.send({
        success: true,
        art: arts,
    });
});

retrieve()
    .then((a) => {
        if (a && Array.isArray(a)) {
            console.log(chalk.cyan(`Successfully retrieved previous arts. Size: ${a.length}`));
            arts.push(...a);
        }
    });

const server = app.listen(PORT, () => {
    console.log(chalk.green(`Server now listening on PORT:${PORT} - Current Time: ${new Date()}`));
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
    const socketId = v4();

    socket.id = socketId;
    socket.isAlive = true;

    socketMap.set(socketId, socket);

    socket.on('error', console.error);
    socket.on('pong', () => {
        socket.isAlive = true;
    });

    console.log(chalk.green(`Websocket connected. Assigned ID of ${socketId}. IP: ${socket?._socket?.remoteAddress}`));
});

const unsub = eventEmitter.subscribe('art', (artData) => {
    wss.clients.forEach((socket) => {
        console.log(chalk.cyan(`Sending Art Data over Websocket to ${socket?.id}`), JSON.stringify(artData, null, 2));
        socket.send(JSON.stringify({ art: artData, type: 'art' }));
    });
});

const interval = setInterval(async () => {
    wss.clients.forEach((socket) => {
        if (!socket?.isAlive) {
            socketMap.delete(socket?.id);
            return socket?.terminate();
        }

        socket.isAlive = false;
        socket.ping();
    });

    await store(arts);

    console.log(chalk.cyan(`Cached current art collection. Size: ${arts.length}. Time: ${new Date()}`));
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
    unsub();
});

process.on('beforeExit', async () => {
    console.log(chalk.cyan(`Doing cleanup before exit.`));

    await store(arts);
});
