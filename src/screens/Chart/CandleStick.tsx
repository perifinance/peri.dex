import React from "react";
import LWchart from "./LWchart";

const CustomShapeBarChart = ({ source, destinate, chartTime }) => {
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

	return <LWchart chart={data} chartTime={chartTime} />;
};

export default CustomShapeBarChart;
