import { useEffect, useRef } from "react";

const useInterval = () => {
    const savedCallback = useRef(null);
	const savedId = useRef(null);

	const stopInterval = () => {
		savedId.current && clearInterval(savedId.current);
		savedId.current = null;
	};

	const initInterval = (callback, delay) => {
		stopInterval();
		savedCallback.current = callback;
		savedId.current = setInterval(executeCallback, delay);
	};

	const executeCallback = () => {
		savedCallback.current();
	};

    useEffect(() => {
        return () => stopInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

	return {initInterval, stopInterval};
};

export default useInterval;
