import React from 'react'

export type SelectBarProps = {
	isBuy: boolean;
	setIsBuy: (isBuy: boolean) => void;
}

const SelectBar:React.FC<SelectBarProps> = ({isBuy, setIsBuy}) => {
	return (
		<div className="flex flex-row items-center m-2 lg:my-4">
			<button
				className={`w-[50%] bg-transparent cursor-pointer p-2 hover:bg-gradient-to-l ${
					isBuy
						? "bg-gradient-to-t active:bg-gradient-to-tr from-cyan-450/10 to-blue-950 border-cyan-450 text-cyan-450 font-medium border-b-[2px]"
						: "border-blue-950 hover:from-cyan-450/10 hover:to-blue-950 border-b-[2px] border-cyan-450/10"
				} hover:text-cyan-450 hover:font-medium rounded-tl-md`}
				onClick={() => {
					// setPayAmount("");
					// setReceiveAmount("");
					setIsBuy(true);
				}}
			>
				Buy
			</button>
			<button
				className={`w-[50%] bg-transparent cursor-pointer p-2 hover:bg-gradient-to-l ${
					isBuy
						? "border-blue-950 hover:from-red-400/20 hover:to-blue-950 border-b-[2px] border-red-400/20"
						: "bg-gradient-to-t active:bg-gradient-to-tr from-red-400/20 to-blue-950 border-red-400 text-red-400 font-medium border-b-[2px]"
				} hover:text-red-400 hover:font-medium rounded-tr-md`}
				onClick={() => {
					// setPayAmount("");
					// setReceiveAmount("");
					setIsBuy(false);
				}}
			>
				Sell
			</button>
		</div>
	)
}


export default SelectBar