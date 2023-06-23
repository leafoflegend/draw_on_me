import React, { useState, useLayoutEffect } from 'react';
import { Layer, Stage, Line } from 'react-konva';

const Canvas = ({
    containerRef,
    art,
}) => {
    const [size, setSize] = useState({
        height: containerRef?.current?.getBoundingClientRect()?.height ?? 0,
        width: containerRef?.current?.getBoundingClientRect()?.width ?? 0,
    });

    useLayoutEffect(() => {
        const handleResize = () => {
            const boundingRect = containerRef?.current?.getBoundingClientRect();

            if (boundingRect) {
                setSize({
                    width: boundingRect.width,
                    height: boundingRect.height,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        const { width, height } = size;

        let intervalId = null;
        if (!width && !height) {
            intervalId = setInterval(() => {
                const { width: newWidth, height: newHeight } =
                containerRef?.current?.getBoundingClientRect() ?? {
                    width: 0,
                    height: 0,
                };

                if (newWidth !== 0 || newHeight !== 0) {
                    setSize({
                        width: newWidth,
                        height: newHeight,
                    });

                    clearInterval(intervalId);
                }
            }, 100);
        }

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [containerRef]);

    return (
        <Stage width={size.width} height={size.height}>
            <Layer>
                {
                    art.map((a) => {
                        return (
                            <Line
                                stroke={a.color}
                                points={a.points}
                                lineCap={'round'}
                                lineJoin={'round'}
                                strokeWidth={a.thickness}
                                key={a.id}
                            />
                        );
                    })
                }
            </Layer>
        </Stage>
    );
};

export default Canvas;
