// todo Switch to existing outside logic custom hook
import { useCallback, useEffect, useRef } from "react";

const useOnClickOutsideRef = (callback, state = undefined, initialState = null) => {
	const modalRef = useRef<any>(initialState);

	const closeModalHandler = useCallback(
		async (e: Event) => {
			try {
				if (state && !modalRef.current?.contains(e.target)) {
					await callback();
				}
			} catch (e) {
				console.error("onClick outside Error: ", e);
			}
		},
		[callback, state]
	);

	useEffect(() => {
		window.addEventListener("click", closeModalHandler);

		return () => {
			window.addEventListener("click", closeModalHandler);
		};
	}, [closeModalHandler]);

	return modalRef;
};

export default useOnClickOutsideRef;
