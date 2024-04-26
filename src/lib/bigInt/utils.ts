import { BigNumberish, BigNumber } from "ethers";
import { formatEther, parseEther, formatBytes32String, parseBytes32String, BytesLike } from "ethers/lib/utils";

export const toBigNumber = (value: BigNumberish):BigNumber => {
    return typeof value === "bigint" ? BigNumber.from(value) : parseEther(String(value));
};

export const fromBigNumber = (value: BigNumberish):string => {
    return formatEther(String(value));
};

export const toBytes32 = (value: string):BytesLike => {
    return formatBytes32String(value);
};

export const fromBytes32 = (bytes: BytesLike):string => {
    return parseBytes32String(bytes);
};

export const toNumber = (value: BigNumberish):number => {
    return typeof value === "number" ? value : Number(fromBigNumber(value));
};

export const toBigInt = (value: string | number | bigint):bigint => {
    return typeof value === "bigint" ? value : toBigNumber(value).toBigInt();
};
