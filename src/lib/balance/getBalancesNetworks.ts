import perifinance from "@perifinance/peri-finance";

import { ethers, providers } from "ethers";

import { SUPPORTED_NETWORKS } from "../network";
import { RPC_URLS } from "../rpcUrl";
import ERC20 from "../contract/abi/ERC20.json";
export const getBalancesNetworks = async (networks, currentWallet, name) => {
    const ProxyERC20 = {
        1: "PeriFinanceToEthereum",
        5: "PeriFinanceToEthereum",
        // 42: 'PeriFinanceToEthereum',
        11155111: "PeriFinanceToEthereum",
        56: "PeriFinanceToBSC",
        97: "PeriFinanceToBSC",
        137: "PeriFinanceToPolygon",
        1284: "PeriFinance",
        1285: "PeriFinance",
        1287: "PeriFinance",
        80001: "PeriFinanceToPolygon",
        8453: "PeriFinance",
        84532: "PeriFinance",
    };

    const periBalances = networks.map((network) => {
        // console.log(network)
        try {
            const sources = perifinance.getSource({ network: SUPPORTED_NETWORKS[network.id].toLowerCase() })[
                name === "ProxyERC20" ? ProxyERC20[network.id] : name
            ];
            console.log(sources);
            const provider = new providers.JsonRpcProvider(RPC_URLS[network.id], network.id);
            const Address = perifinance.getTarget({ network: SUPPORTED_NETWORKS[network.id || network].toLowerCase() })[
                name
            ].address;
            const contract = new ethers.Contract(Address, sources ? sources.abi : ERC20.abi, provider);
            // apis.push(
            return contract.transferablePeriFinance
                    ? contract.transferablePeriFinance(currentWallet)
                    : contract.balanceOf(currentWallet)
            // );
        } catch (error) {
            console.log(error);
            return 0n;
        }});

    return await Promise.all(periBalances);
};

export const getBalanceNetwork = async (network, currentWallet, name) => {
    const ProxyERC20 = {
        1: "PeriFinanceToEthereum",
        5: "PeriFinanceToEthereum",
        // 42: 'PeriFinanceToEthereum',
        11155111: "PeriFinanceToEthereum",
        56: "PeriFinanceToBSC",
        97: "PeriFinanceToBSC",
        137: "PeriFinanceToPolygon",
        1284: "PeriFinance",
        1285: "PeriFinance",
        1287: "PeriFinance",
        80001: "PeriFinanceToPolygon",
        8453: "PeriFinance",
        84532: "PeriFinance",
    };

    try {
        const sources = perifinance.getSource({ network: SUPPORTED_NETWORKS[network.id].toLowerCase() })[
            name === "ProxyERC20" ? ProxyERC20[network.id] : name
        ];
        // console.log("source", sources, "network", network, "name", name);
        const provider = new providers.JsonRpcProvider(RPC_URLS[network.id], network.id);
        const Address = perifinance.getTarget({ network: SUPPORTED_NETWORKS[network.id || network].toLowerCase() })[
            name
        ].address;
        const contract = new ethers.Contract(Address, sources ? sources.abi : ERC20.abi, provider);
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
