import { formatNumber } from 'lib';
import { getSafeSymbol } from 'lib/coinList';
import React from 'react'

export type TokenInputProps = {
	amount: string;
	symbol: string;
	balance: number;
	borderColor: string;
	caption: string;
	setInputAmt: (value: string) => void;
	changePayAmount: (value: string) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({symbol, amount, balance, borderColor, caption, setInputAmt, changePayAmount}) => {
	return (
	<div
		className={`flex rounded-lg relative bg-blue-950 ${
			borderColor ? `border-[1px] ${borderColor}` : "border-none" 
		} text-base py-1 px-2 space-x-2 justify-around h-20`}
	>
		<div className="flex flex-col font-medium justify-start items-center w-[68%] pl-1">
			<span className="flex font-medium w-full text-[10px] text-left text-gray-450/50">{`${caption}`}</span>
			<input
				id="tartget-symbol"
				className=" bg-blue-950  outline-none text-gray-300 font-medium text-left w-full"
				type="text"
				placeholder="0"
				value={amount}
				onChange={(e) => {
					const value = !["", "00"].includes(e.target.value) 
						? e.target.value.length === 2 && e.target.value[0] === "0" && e.target.value[1] !== "."  
							? e.target.value[1]
							: e.target.value
						: "0";
					changePayAmount(value);
				}}
				onFocus={(e) => {
					setInputAmt("");
					e.target.select();
				}}
				onBlur={(e) => setInputAmt(e.target.value)}
			/>
		</div>
		<div className="flex flex-col items-end w-[28%] justify-center space-x-2">
			<div className="flex font-medium cursor-pointer items-center text-gray-450">
				<img
					alt="dest-symbol"
					className="w-[18px] h-[18px]"
					src={`/images/currencies/${getSafeSymbol(symbol,false)}.svg`}
				></img>
				<div className=" flex items-center flex-nowrap arrow-turn">
					<span className="m-1 text-sm tracking-tighter">
						{getSafeSymbol(symbol, false)}
					</span>
				</div>
			</div>
			<div className="flex flex-nowrap text-[10px] text-gray-450/60 absolute right-4 bottom-1">
				<span className="flex items-center mr-1">
					<svg
						width="12"
						height="12"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M0.666748 4C0.666748 2.89543 1.56218 2 2.66675 2H13.3334C14.438 2 15.3334 2.89543 15.3334 4C15.3334 4.36819 15.0349 4.66667 14.6667 4.66667H12.0001C10.1591 4.66667 8.66675 6.15905 8.66675 8C8.66675 9.84095 10.1591 11.3333 12.0001 11.3333H14.6667C15.0349 11.3333 15.3334 11.6318 15.3334 12C15.3334 13.1046 14.438 14 13.3334 14H2.66675C1.56218 14 0.666748 13.1046 0.666748 12V4Z"
							fill="#777E90"
						></path>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M12 6H14.6667C15.0349 6 15.3333 6.29848 15.3333 6.66667V9.33333C15.3333 9.70152 15.0349 10 14.6667 10H12C10.8954 10 10 9.10457 10 8C10 6.89543 10.8954 6 12 6ZM12 8.66667C12.3682 8.66667 12.6667 8.36819 12.6667 8C12.6667 7.63181 12.3682 7.33333 12 7.33333C11.6318 7.33333 11.3333 7.63181 11.3333 8C11.3333 8.36819 11.6318 8.66667 12 8.66667Z"
							fill="#777E90"
						></path>
					</svg>
				</span>
				<span className="font-medium">
					{`${balance ? formatNumber(balance, 4) : ""}`}
				</span>
			</div>
		</div>
	</div>
	);
}


export default TokenInput;