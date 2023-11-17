import { Link, useLocation } from "react-router-dom";

import Receive from "screens/Receive";
import Submit from "screens/Submit";

const Bridge = () => {
    const location = useLocation();

    const pages = ["submit", "receive"];
    return (
        <div className="flex items-center lg:space-x-4">
            {/* max-w-sm */}
            <div className="hidden self-center my-2 min-w-80 w-80 md:flex lg:flex bg-black-500 rounded-l-lg lg:rounded-lg ">
                <div className="flex items-center flex-col p-0">
                    <div className="text-center text-base text-gray-300 py-3 mt-5">
                        Transfer your PERI assets to various chains with PERI Bridge.{" "}
                    </div>
                    <img className="my-2 p-6" src={`/images/icon/bridge.png`} alt="bg_left"></img>
                </div>
            </div>

            <div className="w-full ">
                <div className="flex font-medium text-lg">
                    <div className="w-full pt-4 px-9 font-semibold text-center lg:text-left rounded-t-lg bg-gray-700">
                        Bridge
                    </div>
                    {/* {pages.map((page, index) => {
                        return (
                            <div
                                key={index}
                                className={`basis-1/2 rounded-t-lg cursor-pointer ${
                                    location.pathname.includes(page) ? "bg-gray-700" : "bg-gray-500"
                                }`}
                            >
                                <Link to={`/bridge/${page}`}>
                                    <div className="w-full py-4 px-9 text-center lg:text-left">
                                        {page.charAt(0).toUpperCase() + page.slice(1)}
                                    </div>
                                </Link>
                            </div>
                        );
                    })} */}
                </div>
                {location.pathname.includes("submit") ? <Submit></Submit> : <Receive></Receive>}
            </div>
        </div>
    );
};
export default Bridge;
