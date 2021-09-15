import { contracts } from 'lib/contract'

export const getBalance = async (address: string, coinName: string, decimal) => {
    try {
        if(decimal === 18) {
            return BigInt((await contracts[coinName].balanceOf(address)).toString());    
        } else {
            return BigInt((await contracts[coinName].balanceOf(address)).toString()) * BigInt(Math.pow(10, 18 - decimal).toString());
        }
    } catch(e) {

    }
    return 0n
};

// export const getBalances = async (address: string) => {
//     return await periFinance.js.collateral(address);
// };