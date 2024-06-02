import React,{ReactNode, useEffect, useState} from "react";
import { formatNumber } from "lib";

export enum SignType { NoSign = 0, Sign, Imoti };

const SignChars = {
	[SignType.NoSign]: {up: "", dn: ""},
	[SignType.Sign]: {up: "+", dn: "-"},
	[SignType.Imoti]: {up: "▲", dn: "▼"},
};

export type LableProps = {
	value: number;
	isActive?: boolean;
	prevValue?: number;
	tailWinStyle?: string;
	precision?: number;
	useGivenPrev?: boolean;
	showPercent?: boolean;
	showUpDn?: SignType;
	children?: ReactNode;
	id?: string;
};
const ColoredLabel: React.FC<LableProps> = ({
	id, value, prevValue, isActive=true, tailWinStyle, precision=2, showPercent=false, useGivenPrev=false, showUpDn=SignType.NoSign, children 
}) => {
	const [nLable, setNLabel] = useState<number>(0);
	const [upDown, setUpDown] = useState<string>('');
	const [twColor, setTwColor] = useState<string>('');
	const [label, setLablel] = useState<string>('0');

	useEffect(() => {
		if (value === undefined && prevValue === undefined) return;

		const tmpChange = value - (useGivenPrev ? prevValue : nLable);
		const change = showPercent 
			? (prevValue ? tmpChange * 100 / prevValue : 0)
			: tmpChange;
		const [twColor, upDn] = change !== 0 
			? change < 0
				? ["text-red-400",  SignChars[showUpDn].dn]
				: ["text-blue-500", SignChars[showUpDn].up]
			: ["text-gray-300", ""];

		const newValue = useGivenPrev ? change : value;
		// const upDn 

		setTwColor(twColor);
		// if (change !== 0 ) {
		setNLabel(newValue);
		setUpDown(showUpDn?upDn:"");
		const label = ((newValue < 0) ? formatNumber(newValue, precision).substring(1)
			: formatNumber(newValue, precision)) + (showPercent ? "%" : "");
		setLablel(label);
		// }
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	return (
		<div className={`text-nowrap ${
			tailWinStyle ? `${tailWinStyle} ` : ""}${
			isActive ? twColor: "text-gray-600"}`}
			id={id?id:"clb"}
		>
			{upDown}{label}
			{children}
		</div>
	);
}

export default ColoredLabel;