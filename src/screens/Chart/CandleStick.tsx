import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updatePrice, updateTooltip } from "reducers/rates";
import LWchart from "./LWchart";

const dummy = { open: "1", low: "1", high: "1", close: "1" };

const CustomShapeBarChart = ({ source, destinate, chartTime }) => {
	const [data, setData] = useState([]);

	const mergeData = useCallback(() => {
		const values = [];
		const datas = source.length === 0 ? destinate : source;

		datas.forEach((item, index) => {
			const destinationDataItem = destinate[index] ? destinate[index] : destinate[destinate.length - 1] ?? dummy;
			const sourceDataItem = source[index] ? source[index] : source[source.length - 1] ?? dummy;

			values[index] = {
				...item,
				low: String(destinationDataItem.low / sourceDataItem.low),
				close: String(destinationDataItem.close / sourceDataItem.close),
				high: String(destinationDataItem.high / sourceDataItem.high),
				open: String(destinationDataItem.open / sourceDataItem.open),
				timestamp: source ? source.openTime : destinate.openTime,
			};
		});

		return values;
	}, [destinate, source]);

	useEffect(() => {
		const prepareData = mergeData() ?? [];
		setData(
			prepareData.map((el) => {
				const timestamp = new Date(el.openTime);
				const year = timestamp.getFullYear();
				const month = timestamp.getMonth() + 1;
				const day = timestamp.getDate();
				const hour = timestamp.getHours();
				const min = timestamp.getMinutes();
				const openTime = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day} ${
					hour < 10 ? `0${hour}` : hour
				}:${min < 10 ? `0${min}` : min}`;

				return {
					time: Date.parse(openTime) / 1000,
					open: Number(el.open),
					high: Number(el.high),
					low: Number(el.low),
					close: Number(el.close),
					...el,
				};
			})
		);
	}, [mergeData]);

	return <LWchart chart={data} chartTime={chartTime} lastCandle={data[data.length - 1]} />;
};

export default CustomShapeBarChart;
