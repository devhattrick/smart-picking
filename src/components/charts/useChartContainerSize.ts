import { useEffect, useRef, useState } from 'react';

interface ChartContainerSize {
    width: number;
    height: number;
}

export function useChartContainerSize<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [size, setSize] = useState<ChartContainerSize>({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;

        const updateSize = () => {
            const nextSize = {
                width: element.clientWidth,
                height: element.clientHeight,
            };

            setSize((currentSize) => (
                currentSize.width === nextSize.width && currentSize.height === nextSize.height
                    ? currentSize
                    : nextSize
            ));
        };

        updateSize();

        const observer = new ResizeObserver(() => {
            updateSize();
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    return {
        ref,
        width: size.width,
        height: size.height,
    };
}
