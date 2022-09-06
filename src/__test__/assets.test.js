// import * as getBalances from "../lib/thegraph/api";
import getBalances from "../lib/thegraph/api";

describe("getBalances", () => {
	// currencyName 유무

	// 있으면 단일 bigint 출력
	test("have currencyName", async () => {
		// const getBalance = jest.spyOn(getBalances, "../lib/thegraph/api");
		const getBalance = await jest.spyOn(getBalances, "all").mockreturnValue("return value");
		await getBalances.findOne(1);
		console.log("getBalance", getBalance);
		const currencyName = "pUSD";
		const networkId = 1285;
		const address = "0x8143bf76bcb7e6d32e17672fae25be38c723e286";

		expect(typeof getBalance(currencyName, networkId, address)).toBe("bigint");
	});

	// 없으면 배열 출력
	test("dont have currencyName", () => {
		const networkId = 1285;
		const address = "0x8143bf76bcb7e6d32e17672fae25be38c723e286";

		// expect(Array.isArray(getBalances(networkId, address))).toBeTruthy();
	});
});

test("object test", () => {
	const data = { one: 1 };

	data["two"] = 2;
	expect(data).toEqual({ one: 1, two: 2 });
});
