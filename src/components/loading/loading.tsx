import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import "./loading.css";

const Loading = () => {
    // const [colors, setColor] = useState([
    //     'bg-skyblue-500',
    //     'bg-pink-500',
    //     'bg-purple-500',
    //     'bg-skyblue-500',
    // ])

    // this is for all Loading state check
    // const { loadings } = useSelector((state: RootState) => state.loading);
    const { loadings } = useSelector((state: RootState) => state.loading);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isLodaing = Object.values(loadings).reduce((a, b) => a || b);
        // console.log("loading component Loading?", isLodaing);
        setIsLoading(isLodaing);
    }, [loadings]);

    return (
        <div className={isLoading ? "block" : "hidden"}>
            <div className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center bg-gray-600 bg-opacity-50">
                <div className="bg-gray-700 py-2 px-5 rounded-lg flex items-center">
                    {/* <div className="absolute a w-10 h-14 mt-2">
						<div className="absolute w-10 h-14">
							<div className="w-3 h-3 rounded-full bg-skyblue-500"></div>
						</div>
						<div className="absolute w-10 h-14">
							<div className="w-3 h-3 rounded-full bg-pink-500"></div>
						</div>
						<div className="absolute w-10 h-14">
							<div className="w-3 h-3 rounded-full bg-purple-500"></div>
						</div>
					</div> */}
                    <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-inherent"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>

                    <div className="text-withe text-xs font-light mt-2 text-center">
                        Please wait...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
