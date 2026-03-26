import { useState } from "react";

export function usePrevious<T>(value: T): T | undefined {
    const [prev, setPrev] = useState<T | undefined>(undefined);
    const [current, setCurrent] = useState<T>(value);

    if (value !== current) {
        setPrev(current);
        setCurrent(value);
    }

    return prev;
}
