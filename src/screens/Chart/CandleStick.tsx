import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "reducers/loading";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, Cross } from "recharts";
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

	const chart = useRef<any>(null);
	const [lineWidth, setLineWidth] = useState(625.2);
	const resizeHandler = () => {
		const windowSize = window.innerWidth;

		switch (windowSize) {
			case 640:
				setLineWidth(625.2);
				break;
			case 768:
				break;
			case 1024:
				break;
			case 1280:
				setLineWidth(800);
				break;
			case 1536:
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		// const position = chart.current?.getBoundingClientRect();
		// console.log("position", position);

		window.addEventListener("resize", resizeHandler);
		return window.removeEventListener("resize", resizeHandler);
	}, [setLineWidth]);

	const CustomCursor = (props) => {
		const { x, y, width, height, stroke } = props;
		console.log("cursor", x, y, props);
		resizeHandler();
		// ! y 값이 바뀌질 않음 내부적으로 뭔가 로직이 들어가져있는거같음
		// low high 값 기준으로 백분율 구해서 y좌표에 해당하는 값을 옆에 띄워줘야됨
		// maxY lowY maxValue - minValue
		return (
			<React.Fragment>
				<Cross stroke="gray" strokeDasharray={10} x={x + 5} y={y} width={lineWidth} height={height + 20}></Cross>
				<span className="absolute right-10 bg-white-500">20000</span>
			</React.Fragment>
		);
	};

	return (
		<ResponsiveContainer width="100%" height="100%" debounce={1} maxHeight={400} minHeight={"15rem"} ref={chart}>
			<BarChart className="overflow-hidden" data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
				<Tooltip
					separator={" : "}
					labelStyle={{ paddingTop: 4 }}
					contentStyle={{
						padding: "10px 14px",
						borderRadius: 10,
					}}
					// cursor={{ fill: "none" }}
					cursor={<CustomCursor />}
					wrapperStyle={{ border: "none", outline: "none" }}
					itemStyle={{ color: "#ebebeb" }}
					position={{ x: 250, y: -10 }}
					content={({ payload }) => {
						setPrice(payload);

						const isGrowing = payload[0]?.payload ? Number(payload[0]?.payload.open) < Number(payload[0]?.payload.close) : true;
						const color = isGrowing ? "long" : "short";

						return (
							payload && (
								<div className="flex flex-wrap space-x-4 p-2">
									<div>
										<span>High</span>: <span className={`text-${color}-500`}>{decimalSplit(payload[0]?.payload?.high)}</span>
									</div>
									<div>
										<span>Low</span>: <span className={`text-${color}-500`}>{decimalSplit(payload[0]?.payload?.low)}</span>
									</div>
									<div>
										<span>Open</span>: <span className={`text-${color}-500`}>{decimalSplit(payload[0]?.payload?.open)}</span>
									</div>
									<div>
										<span>Close</span>: <span className={`text-${color}-500`}>{decimalSplit(payload[0]?.payload?.close)}</span>
									</div>
								</div>
							)
						);
					}}
				></Tooltip>
				<XAxis dataKey="openTime" />
				<YAxis domain={[minValue, maxValue]} tickFormatter={(e) => e} orientation="right" />

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
