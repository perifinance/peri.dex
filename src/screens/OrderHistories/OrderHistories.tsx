import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "reducers";
import { getExchangeHistories } from "lib/thegraph/api";
import { formatCurrency } from "lib";
import { changeNetwork } from "lib/network";

const OrderHistories = ({}) => {
	const { address, isConnect, networkId } = useSelector((state: RootState) => state.wallet);
	const transaction = useSelector((state: RootState) => state.transaction);
	const [histories, setHistories] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pages, setPages] = useState([]);

	const getPages = (size: number) => {
		let pageCount = Math.ceil(size / 10);
		pageCount = pageCount === 0 ? 1 : pageCount;
		let pages = [];
		for (let a = 0; a < pageCount; a++) {
			pages.push(a);
		}
		return pages;
	};

	const init = useCallback(async () => {
		const histories = await getExchangeHistories({ address, first: 3 });
		setHistories(histories);
		setPages(getPages(histories.length));
	}, [address, getExchangeHistories, setHistories]);

	useEffect(() => {
		if (address && !transaction.hash) {
			if (networkId === Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)) {
				init();
			} else {
				changeNetwork(process.env.REACT_APP_DEFAULT_NETWORK_ID);
				setHistories([]);
			}
		}
	}, [address, transaction, networkId]);

	useEffect(() => {
		if (!isConnect) {
			setHistories([]);
		}
	}, [isConnect]);

	return (
		<div className="w-full grow-0 overflow-visible p-4 mt-4">
			<div className="flex flex-col w-full">
				<div className="text-xl lg:pl-8 font-semibold w-full">Trade Order</div>
				{histories.length > 0 ? (
					<div className="overflow-x-scroll">
						<table className="table-auto mt-4 mb-2 w-full">
							<thead>
								<tr className="text-lg text-gray-300">
									<th className="font-medium">Date/Time</th>
									<th className="font-medium">Received</th>
									<th className="font-medium">Paid</th>
									{/* <th className="font-medium">Price</th> */}
									<th className="font-medium">Action</th>
									<th className="font-medium min-w-12"> </th>
								</tr>
							</thead>

							<tbody>
								{histories.map((e) => (
									<tr className="border-b border-gray-500 h-10" key={e.id}>
										<td className="text-center">
											<span>{e.date}</span>
										</td>
										<td className="text-center">
											<div className="flex justify-end left">
												<img
													className="w-5 h-5 pr-1"
													src={`/images/currencies/${e.dest}.svg`}
													alt="currencies"
												></img>
												{formatCurrency(e.amountReceived, 8)}
												<span className="pl-1 font-medium"> {e.dest}</span>
											</div>
										</td>

										<td className="text-center">
											<div className="flex justify-end left">
												<img
													className="w-5 h-5 pr-1"
													src={`/images/currencies/${e.src}.svg`}
													alt="currencies"
												></img>
												{formatCurrency(e.amount, 8)}
												<span className="pl-1 font-medium"> {e.src}</span>
											</div>
										</td>
										{/* <td className="text-center">{formatCurrency(e.amount * 10n ** 18n / e.amountReceived, 5)} <span className="pl-1 font-medium"> {e.src}</span></td> */}
										<td className="text-center">
											<span
												className={`font-medium ${
													e.state === "Settled" ? "text-skyblue-500" : "text-yellow-500"
												}`}
											>
												{e.state}
											</span>
										</td>
										<td className="text-center">
											<img
												id="moonbeam"
												className="w-8 h-8 cursor-pointer mx-auto"
												src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC4UlEQVR4Ae2WA6wcYRzE65hFXDeqbdu2bbdxatu2bdu2bdtupzOb913vtl1crZf8Vv//zM6Hd3eRAPxS/gf4H8CxkDdZxwrkGHmts+6djb5e62RQjsCOzehrtd4B8iXvfLxC5mlokHcLWhQ+gpakfp6NqJh52vVWRY7Hc3o5a5GLpO53pnymKeqXTnr6bEalLDNvsB7DK4BMYjfKt/0Dz3DhGelo03XVcw/dPvk7BZBJdLLLzaRgyp6aGV3fJokjdEk4ygeq8dqLnSSaU4DGXgZaz8Kp+qBx/p26f0eONM6/652eqaYeH9T7LIDWh1zyE0DkS9YJxdMOEbrWs3ACnCPR7AHqtSh8GLVzreKGmYVymSZZVMo6i89WQzUTwA31+PAR1QMBlIZreLN8pskom3HCF1GtYb6tnqNTj0+fkySKFaBWzhVDTEPD1jPQdcdSDH6wWljXDVrNMAYczUQUSzPI2gcFUnTnqDvpbN2XSDccPn1MiIqReBObU/ROD9uPmYfBT1agx+XZ6HxqitC1nqkWEOdL3gVF0wxE9RxLhK6tZ2UyjINfH81E80IHdylAF2KlW/PyMHbcP4HOJ6ag04nJBhpMlVijkjjwcn1YCRPC+Fx4exuP3jxDvzNz3HxEDwU4RKwpuvX6IfQ34OzcEKHQCNSjXo3UHqBU+lEwPg/ePsX7Dx8w7NwiNx9xRAFeEQy+vxpDLyzEhEsrrcYR55dg8NkFQemnqMcI339agsURox8P49P7zCwMPDvP0g09txALr29z8nkdEkBF03jk0XlsvXckVPggIHzGf7lH5Bo5r7MJYPdZdnMn7r9+7OTzNHgJND2m0WvqDtu+Q77ax2xCbQxtEG0UNXpuHluAr/aRMA55HMa/4WNpbAG+2seIy5IP1gjazLSmaPDD1ULXwYk/qFcaG1/tEywuR54QOPDE5eVf7WMXxyI9yFHyhjwjB0hX1Txe/lU+/3+W/w/wP8BHrC3DQabFPxAAAAAASUVORK5CYII="
												onClick={() =>
													window.open(
														`https://moonriver.moonscan.io/tx/${e.appendedTxid || e.settledTxid}`,
														"_blank"
													)
												}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-base text-center lg:text-left lg:pl-8 border-b border-gray-500 text-gray-300 font-medium mt-5">
						No Trade History
					</div>
				)}
			</div>
		</div>
	);
};
export default OrderHistories;
