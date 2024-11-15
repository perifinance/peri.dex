// todo Switch to existing outside logic custom hook
import { useCallback, useEffect, useRef } from "react";

const useOnClickOutsideRef = (callBackState:(state:boolean)=>void, state:boolean, targetId:string) => {
	const modalRef = useRef<any>(null);

	const closeModalHandler = useCallback(
		(e) => {
			try {
				if (state && e.target.id !== targetId && !modalRef.current?.contains(e.target)) {
					console.log("modalRef.current", state, targetId);
					callBackState(!state);
				}
			} catch (e) {
				console.error("onClick outside Error: ", e);
			}
		},

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[state]
	);

	useEffect(() => {
		window.addEventListener("click", closeModalHandler);

		return () => {
			window.removeEventListener("click", closeModalHandler);
			modalRef.current = null;
		};
	}, [closeModalHandler]);




	return modalRef;
};

export default useOnClickOutsideRef;
