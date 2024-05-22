// import { Link, useLocation } from "react-router-dom";

import { useEffect } from "react";
import KyberswapWidget from "screens/Swap/Kyberswap";

const Swap = ({setStopUpdate}) => {
    useEffect(() => {
        setStopUpdate(true);
        return () => {
            setStopUpdate(false);
        }
    }, [setStopUpdate]);

    return (
        <div className="flex justify-self-center items-center lg:space-x-4 lg:h-[82%]">
            <div className="flex flex-col w-full lg:h-full rounded-lg">
                {/* <div className="flex justify-center font-medium w-full text-lg">
                    <div className="w-full pt-3 lg:pt-8 lg:w-[94%] px-9 font-semibold text-center lg:text-left">
                        Swap
                    </div>
                </div> */}
				<KyberswapWidget></KyberswapWidget>
            </div>
        </div>
    );
};
export default Swap;
