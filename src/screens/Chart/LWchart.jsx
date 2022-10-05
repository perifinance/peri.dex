import React, { Component } from "react";
import Chart from "@qognicafinance/react-lightweight-charts";
import { createChart } from "lightweight-charts";

class LWchart extends Component {
	constructor(props) {
		super(props);

		this.state = {
			options: {
				alignLabels: true,
				timeScale: {
					rightOffset: 10,
					barSpacing: 3,
					fixLeftEdge: true,
					lockVisibleTimeRangeOnResize: true,
					rightBarStaysOnScroll: true,
					borderVisible: false,
					visible: true,
					timeVisible: true,
					secondsVisible: false,
				},
				layout: {
					backgroundColor: "#212121",
					textColor: "#ebebeb",
				},
				grid: {
					vertLines: {
						color: "#212121",
					},
					horzLines: {
						color: "#212121",
					},
				},
			},
		};
	}

	render() {
		const { chart } = this.props;
		const chandleSeries = chart.map((el) => {
			const time = new Date(el.closeTime);
			const year = time.getFullYear();
			const month = time.getMonth();
			const day = time.getDate();

			return {
				time: `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`,
				open: Number(el.open),
				high: Number(el.high),
				low: Number(el.low),
				close: Number(el.close),
				...el,
			};
		});

		return <Chart options={this.state.options} candlestickSeries={[{ data: chandleSeries }]} autoWidth height={400} />;
	}
}

export default LWchart;
