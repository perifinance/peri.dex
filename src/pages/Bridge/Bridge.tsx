// import { Link, useLocation } from "react-router-dom";

import Submit from "screens/Submit";

const Bridge = () => {

    return (
        <div className="flex justify-self-center items-center lg:space-x-4">
            {/* max-w-sm */}
            <div className="hidden self-center my-2 min-w-80 h-[512px] w-80 lg:block bg-black-500 rounded-l-lg lg:rounded-lg ">
                <div className="block relative p-0">
                    <div className="absolute text-center text-base font-medium text-blue-100 py-3 mt-5 z-10">
                        Transfer your Pynths to all supported chains with PERI Bridge.
                    </div>
                    <img className="absolute h-[512px]" src={`/images/icon/bridge_2.png`} alt="bg_left"></img>
                </div>
                
            </div>

            <div className="flex flex-col w-full">
                <div className="flex font-medium text-lg">
                    <div className="w-full pt-3 px-9 font-semibold text-center lg:text-left rounded-t-lg bg-gray-700">
                        Bridge
                    </div>
                </div>
                {<Submit></Submit> }
            </div>
        </div>
    );
};
export default Bridge;
