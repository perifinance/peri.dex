import { RPC_URLS } from "lib/rpcUrl";

// eslint-disable-next-line
export const networkInfo = {
    1: {
        chainId: "0x1",
        chainName: "Ethereum",
        rpcUrls: RPC_URLS[1],
        blockExplorerUrls: "https://etherscan.io",
    },
    5: {
        chainId: "0x5",
        chainName: "Goerli",
        rpcUrls: RPC_URLS[5],
        blockExplorerUrls: "https://goerli.etherscan.io",
    },
    11155111: {
        chainId: "0xAA36A7",
        chainName: "Sepolia",
        rpcUrls: RPC_URLS[11155111],
        blockExplorerUrls: "https://sepolia.etherscan.io",
    },
    56: {
        chainId: "0x38",
        chainName: "BSC",
        rpcUrls: RPC_URLS[56],
        blockExplorerUrls: "https://bscscan.com",
    },
    1284: {
        chainId: "0x504",
        chainName: "Moonbeam",
        rpcUrls: RPC_URLS[1284],
        blockExplorerUrls: "https://moonbeam.moonscan.io",
    },
    1285: {
        chainId: "0x505",
        chainName: "Moonriver",
        rpcUrls: RPC_URLS[1285],
        blockExplorerUrls: "https://moonriver.moonscan.io",
    },
    97: {
        chainId: "0x61",
        chainName: "BSCTest",
        rpcUrls: RPC_URLS[97],
        blockExplorerUrls: "https://testnet.bscscan.com",
    },
    137: {
        chainId: "0x89",
        chainName: "Polygon",
        rrpcUrls: RPC_URLS[137],
        blockExplorerUrls: "https://polygonscan.com/",
    },
    1287: {
        chainId: "0x507",
        chainName: "Moonbase",
        rpcUrls: RPC_URLS[1287],
        blockExplorerUrls: "https://moonbase.moonscan.io",
    },
    80001: {
        chainId: "0x13881",
        chainName: "Mumbai",
        rpcUrls: RPC_URLS[80001],
        blockExplorerUrls: "https://mumbai.polygonscan.com",
    },
    8453: {
        chainId: "0x2105",
        chainName: "Base",
        rpcUrls: RPC_URLS[8453],
        blockExplorerUrls: "https://base.basescan.org",
    },
    84532: {
        chainId: "0x14A34",
        chainName: "BaseSepolia",
        rpcUrls: RPC_URLS[84532],
        blockExplorerUrls: "https://sepolia.basescan.org",
    },
};

export const natives = {
    1: "ETH",
    5: "ETH",
    11155111: "ETH",
    56: "BNB",
    1284: "GLMR",
    1285: "MOVR",
    97: "BNB",
    137: "MATIC",
    1287: "DEV",
    80001: "MATIC",
    8453: "ETH",
    84532: "ETH",
};
