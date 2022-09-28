import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "reducers/loading";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { decimalSplit } from "lib/price/decimalSplit";

const Candlestick = (props) => {
	const {
		x,
		y,
		width,
		height,
		low,
		high,
		openClose: [open, close],
	} = props;

	const isGrowing = open < close;
	const color = isGrowing ? "#87F7CA" : "#ED6D87";
	const ratio = Math.abs(height / (open - close));

	return (
		<g stroke={color} fill={color} strokeWidth="2">
			<path
				d={`
          M ${x},${y}
          L ${x},${y + height}
          L ${x + width},${y + height}
          L ${x + width},${y}
          L ${x},${y}
        `}
			/>
			{/* bottom line */}
			{isGrowing ? (
				<path
					d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - low) * ratio}
          `}
				/>
			) : (
				<path
					d={`
            M ${x + width / 2}, ${y}
            v ${(close - low) * ratio}
          `}
				/>
			)}
			{/* top line */}
			{isGrowing ? (
				<path
					d={`
            M ${x + width / 2}, ${y}
            v ${(close - high) * ratio}
          `}
				/>
			) : (
				<path
					d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - high) * ratio}
          `}
				/>
			)}
		</g>
	);
};

const CustomShapeBarChart = ({ source, destinate, setPrice }) => {
	const mergeData = () => {
		const values = [];
		const datas = source.length === 0 ? destinate : source;

		datas.forEach((item, index) => {
			const destinationDataItem = destinate[index] ? destinate[index] : destinate[destinate.length - 1];
			const sourceDataItem = source[index] ? source[index] : source[source.length - 1];

			let close = 0;
			let high = 0;
			let low = 0;

			close = destinationDataItem.close ?? 1 / sourceDataItem.close ?? 1;
			high = destinationDataItem.high ?? 1 / sourceDataItem.high ?? 1;
			low = destinationDataItem.low ?? 1 / sourceDataItem.low ?? 1;

			values.push({ low, close, high, timestamp: source.openTime, ...item });
		});

		return values;
	};

	const data = mergeData() ?? [];

	const minValue = data.reduce((minValue, { low, open, close }) => {
		const currentMin = Math.min(low, open, close);
		return minValue === null || currentMin < minValue ? currentMin : minValue;
	}, null);
	const maxValue = data.reduce((maxValue, { high, open, close }) => {
		const currentMax = Math.max(high, open, close);
		return currentMax > maxValue ? currentMax : maxValue;
	}, minValue);

	return (
		<ResponsiveContainer width="100%" height="100%" debounce={1} maxHeight={400} minHeight={"15rem"}>
			<BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
				<Tooltip
					labelStyle={{ color: "#151515" }}
					contentStyle={{
						background: "#151515",
						borderColor: "#151515",
						color: "#151515",
					}}
					itemStyle={{ color: "#ebebeb" }}
					position={{ y: 0 }}
					content={({ active, payload, label }) => {
						setPrice(payload);

						return (
							payload && (
								<div className="bg-gray-300 p-2">
									<div>
										<span className="">High</span>: {decimalSplit(payload[0]?.payload?.high)}
									</div>
									<div>
										<span className="">Low</span>: {decimalSplit(payload[0]?.payload?.low)}
									</div>
									<div>
										<span className="">Open</span>: {decimalSplit(payload[0]?.payload?.open)}
									</div>
									<div>
										<span className="">Close</span>: {decimalSplit(payload[0]?.payload?.close)}
									</div>
								</div>
							)
						);
					}}
				></Tooltip>
				<XAxis dataKey="openTime" />
				<YAxis domain={[minValue, maxValue]} tickFormatter={(e) => e} hide={true} />

				<Bar dataKey="openClose" shape={<Candlestick />}>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
};

export default CustomShapeBarChart;
