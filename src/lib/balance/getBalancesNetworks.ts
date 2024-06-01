export const getBalanceNetwork = async (network, currentWallet, name, contracts) => {
    // const target = name === "ProxyERC20" ? "PeriFinance" : "pUSD";

    if (!network || !contracts[name]) return 0n;
    try {
        const contract = contracts[name];
        // apis.push(
        return contract.transferablePeriFinance
                ? contract.transferablePeriFinance(currentWallet)
                : contract.balanceOf(currentWallet)
        // );
    } catch (error) {
        console.log(error);
        return 0n;
    };
};
