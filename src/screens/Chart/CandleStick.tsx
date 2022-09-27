import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "reducers/loading";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";

// const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

const Candlestick = (props) => {
	const {
		fill,
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

const CustomShapeBarChart = ({ source, destinate }) => {
	console.log("CUSTOME", source, destinate);

	// todo 여기서 합쳐주면 될듯? 어차피 빈배열이면 usd임 ㅇㅇ

	const dataHandler = () => {
		const dataList = source.length > 0 ? source : destinate;
		const apiData = dataList.map((data, idx) => {
			let result = {};
			Object.keys(data).forEach((key) => {
				if (key !== "openClose") {
					const sourceData = data[key] ? data[key] : 1;
					const destinateData = destinate[idx][key] ? destinate[idx][key] : 1;
					result[key] = sourceData / destinateData;
				} else if (key === "openClose") {
					result[key] = [data[key][0] / destinate[idx][key][0], data[key][1] / destinate[idx][key][1]];
				} else if (key === "openTime") {
					result["openTime"] = data[key];
				}
			});

			return result;
		});

		console.log("apiData", apiData);
		return apiData;
	};

	// const data = dataHandler();
	const data = destinate;

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
					itemStyle={{ color: "#ffffff" }}
					position={{ y: 0 }}
				></Tooltip>
				<XAxis dataKey="openTime" />
				{/* <YAxis domain={[minValue, maxValue]} /> */}

				<Bar
					dataKey="openClose"
					shape={<Candlestick />}
					// label={{ position: 'top' }}
				>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
};

export default CustomShapeBarChart;
