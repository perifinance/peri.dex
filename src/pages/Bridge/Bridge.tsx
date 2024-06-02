// import { Link, useLocation } from "react-router-dom";

import Submit from "screens/Submit";

const Bridge = () => {

    return (
        <div className="flex justify-self-center items-center justify-center lg:space-x-4 lg:w-[80%] lg:h-[85%]">
            <div className="flex w-full lg:h-full bg-gradient-to-tl lg:mt-5 lg:px-10 lg:py-5 from-cyan-950 via-blue-950 to-cyan-950 rounded-lg">
                {/* <div className="flex justify-center font-medium w-full text-lg">
                    <div className="w-full pt-3 lg:pt-8 lg:w-[94%] px-9 font-semibold text-center lg:text-left">
                        Bridge
                    </div>
                </div> */}
                <div className="w-full h-full"> 
                    {<Submit></Submit> }
                </div>
            </div>
            {/* <div className="hidden self-center my-2 min-w-80 lg:h-full w-80 lg:block rounded-l-lg lg:rounded-lg ">
                {<div className="block relative p-0">
                    <div className="absolute text-center text-base font-medium text-blue-100 py-3 mt-5 z-10">
                        Transfer your Pynths to all supported chains with PERI Bridge.
                    </div>
                    <img className="absolute h-[512px]" src={`/images/icon/bridge_2.png`} alt="bg_left"></img>
                </div>}
                
            </div> */}

            
        </div>
    );
};
export default Bridge;
