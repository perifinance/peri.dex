import React,{ReactNode, useEffect, useState} from "react";
import { formatNumber } from "lib";

export type CoinType = {
/* 	price: number;
	change?: number;
	isActive: boolean; */
	coin: any;
	fontSize?: string;
	width?: string;
	precision?: number;
	tag?: string;
	showUpDown?: boolean;
	children?: ReactNode;
};
const ColoredPrice: React.FC<CoinType> = ({/* price, change, isActive, */ coin, fontSize='10px', width='44px', precision=2, tag="", showUpDown=false, children }:CoinType) => {
/* 	const [sPrice, setSPrice] = useState<string>('0');
	const [upDown, setUpDown] = useState<string>('');
	const [nPrice , setNPrice] = useState<number>(0);

	useEffect(() => {
		const value = change;

		const { sPrice, upDown } = value !== 0 
			? value < 0
				? { sPrice: formatNumber(price, precision).substring(1), upDown: "▼" }
				: { sPrice: formatNumber(price, precision), upDown: "▲" }
			: { sPrice: formatNumber(price, precision), upDown: "" };

		setNPrice(price);
		setSPrice(sPrice);
		setUpDown(upDown);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [price, change]); */


	return (
		<div className={`text-end w-[${width}] text-[${fontSize}] font-medium text-nowrap ${
				coin?.isActive
					? (showUpDown ? coin?.change :coin?.upDown) !== 0
						? (showUpDown ? coin?.change :coin?.upDown) > 0
							? "text-blue-500"
							: "text-red-400"
						: "text-gray-300"
					: "text-gray-600"
			}`}
		>
			{/* {showUpDown ? upDown : ""}{sPrice}{tag} */}
			
			{showUpDown && coin?.change !== 0 ? (coin?.change > 0 ? "▲" : "▼") : ""}
			{(showUpDown ? coin?.change :coin?.price) < 0
				? formatNumber(showUpDown ? coin?.change :coin?.price, precision).substring(1)
				: formatNumber(showUpDown ? coin?.change :coin?.price, precision)}{tag}
			{children}
		</div>
	);
}

export default ColoredPrice;