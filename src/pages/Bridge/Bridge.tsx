import { Link, useLocation } from "react-router-dom";

import Receive from "screens/Receive";
import Submit from "screens/Submit";

const Bridge = () => {
	const location = useLocation();

	return (
		<div className="flex lg:space-x-4">
			{/* max-w-sm */}
			<div className="hidden min-w-80 w-80 md:block lg:block bg-black-500 py-10 pl-9 pr-4 rounded-l-lg lg:rounded-lg">
				<div className="flex flex-col p-0 justify-items-start">
					<div className="text-5xl" style={{ margin: "0 0 0 -4px" }}>
						BRIDGE
					</div>
					<div className="text-base text-gray-300 py-4">Transfer your PERI assets to various chains with PERI Bridge. </div>
					<img className="mt-4" src={`/images/icon/bridge.png`}></img>
				</div>
			</div>

			<div className="lg:mb-6 w-full">
				<ul className="flex">
					<Link
						className={`py-3 font-normal text-lg px-9 rounded-tr-lg lg:rounded-t-lg cursor-pointer ${
							location.pathname.includes("submit") ? "bg-gray-700" : "bg-gray-500"
						}`}
						to="/bridge/submit"
					>
						Submit
					</Link>
					<Link
						className={`py-3 font-normal text-lg px-9 rounded-t-lg cursor-pointer ${
							location.pathname.includes("receive") ? "bg-gray-700" : "bg-gray-500"
						}`}
						to="/bridge/receive"
					>
						Receive
					</Link>
				</ul>
				{location.pathname.includes("submit") ? <Submit></Submit> : <Receive></Receive>}
			</div>
		</div>
	);
};
export default Bridge;
