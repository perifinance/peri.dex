// import { Link, useLocation } from "react-router-dom";

import { useEffect, useLayoutEffect } from "react";
import KyberswapWidget from "screens/Swap/Kyberswap";

const Swap = () => {

    useLayoutEffect(() => {
        console.log("Swap");
    }, []);
    return (
        <div className="flex items-center justify-center lg:space-x-4 h-[86vh] lg:h-[82%]">
            <div className="flex w-fit h-fit rounded-[10px] border-[1px] border-[#0d3754]">
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
