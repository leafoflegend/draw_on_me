import React, {useEffect, useRef, useState} from 'react';
import classes from './Home.module.css';
import Canvas from './Canvas.jsx';
import websocket from '../network/websocket.js';
import getArt from './get_art.js';

const Home = () => {
    const [art, setArt] = useState([]);

    useEffect(() => {
        const initialize = async () => {
            const arts = await getArt();

            setArt(arts);
        };

        initialize();
    }, []);

    useEffect(() => {
        const unsub = websocket.onMessage((ev) => {
            if (ev.type.toUpperCase() === 'ART') {
                console.log(`Received Art over Websocket. ${ev.art.id}`);

                setArt([...art, ev.art]);
            }
        });

        return unsub;
    }, [art]);

    const containerRef = useRef(null);

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <h2>Draw On Me</h2>
                <code>
                    To draw anything on me, make a request to my URL and then /art. Make a POST request with a JSON body and include:
                    "thickness": number,
                    "color": string color name or hex value,
                    "points": an array of x, y coordinates.
                </code>
            </div>
            <div className={classes.grow_container} ref={containerRef}>
                <Canvas containerRef={containerRef} art={art} />
            </div>
        </div>
    );
}

export default Home;
