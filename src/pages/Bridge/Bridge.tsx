// import { Link, useLocation } from "react-router-dom";

import Submit from "screens/Submit";

const Bridge = () => {

    return (
        <div className="flex justify-self-center items-center lg:space-x-4">
            {/* max-w-sm */}
            <div className="hidden self-center my-2 min-w-80 w-80 md:flex lg:flex bg-black-500 rounded-l-lg lg:rounded-lg ">
                <div className="flex items-center flex-col p-0">
                    <div className="text-center text-base text-gray-300 py-3 mt-5">
                        Transfer your PERI assets to various chains with PERI Bridge.{" "}
                    </div>
                    <img className="my-2 p-6" src={`/images/icon/bridge.png`} alt="bg_left"></img>
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
