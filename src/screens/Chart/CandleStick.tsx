import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updatePrice, updateTooltip } from "reducers/rates";
import LWchart from "./LWchart";

const dummy = { open: "1", low: "1", high: "1", close: "1" };

const CustomShapeBarChart = ({ source, destinate, chartTime }) => {
	const dispatch = useDispatch();

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

	const data = mergeData() ?? [];

	return <LWchart chart={data} chartTime={chartTime} />;
};

export default React.memo(CustomShapeBarChart);
