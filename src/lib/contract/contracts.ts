import perifinance from "@perifinance/peri-finance";

import { ethers, providers } from "ethers";

import { SUPPORTED_NETWORKS } from "../network";
import { RPC_URLS } from "../rpcUrl";
import ERC20 from "../contract/abi/ERC20.json";
import { useEffect, useState } from "react";

// import { clear } from 'console'

const naming = {
    // SystemSettings: "SystemSettings",
    ExchangeRates: "ExchangeRates",
    Exchanger: {
        1: "ExchangerWithVirtualPynth",
        5: "ExchangerWithVirtualPynth",
        42: "ExchangerWithVirtualPynth",
        56: "ExchangerWithVirtualPynth",
        97: "Exchanger",
        137: "ExchangerWithVirtualPynth",
        1284: "Exchanger",
        1285: "ExchangerWithVirtualPynth",
        1287: "Exchanger",
        8453: "Exchanger",
        84532: "Exchanger",
        80001: "Exchanger",
        11155111: "Exchanger",
    },
    ProxyERC20: {
        1: "PeriFinanceToEthereum",
        5: "PeriFinanceToEthereum",
        42: "PeriFinanceToEthereum",
        56: "PeriFinanceToBSC",
        97: "PeriFinanceToBSC",
        137: "PeriFinanceToPolygon",
        1284: "PeriFinance",
        1285: "PeriFinance",
        1287: "PeriFinance",
        8453: "PeriFinance",
        84532: "PeriFinance",
        80001: "PeriFinanceToPolygon",
        11155111: "PeriFinanceToEthereum",
    },
    ProxyERC20pUSD: "MultiCollateralPynth",
    BridgeState: "BridgeState",
    BridgeStatepUSD: "BridgeState",
    ProxyERC20pBTC: "MultiCollateralPynth",
    ProxyERC20pETH: "MultiCollateralPynth",
    ProxyERC20pBNB: "MultiCollateralPynth",
    ProxyERC20p1INCH: "MultiCollateralPynth",
    ProxyERC20pAAVE: "MultiCollateralPynth",
    ProxyERC20pANKR: "MultiCollateralPynth",
    ProxyERC20pAVAX: "MultiCollateralPynth",
    ProxyERC20pAXS: "MultiCollateralPynth",
    ProxyERC20pCAKE: "MultiCollateralPynth",
    ProxyERC20pCOMP: "MultiCollateralPynth",
    ProxyERC20pCRV: "MultiCollateralPynth",
    ProxyERC20pDOT: "MultiCollateralPynth",
    ProxyERC20pEUR: "MultiCollateralPynth",
    ProxyERC20pLINK: "MultiCollateralPynth",
    ProxyERC20pLUNA: "MultiCollateralPynth",
    ProxyERC20pMANA: "MultiCollateralPynth",
    ProxyERC20pMKR: "MultiCollateralPynth",
    ProxyERC20pSAND: "MultiCollateralPynth",
    ProxyERC20pSNX: "MultiCollateralPynth",
    ProxyERC20pSUSHI: "MultiCollateralPynth",
    ProxyERC20pUNI: "MultiCollateralPynth",
    ProxyERC20pXRP: "MultiCollateralPynth",
    ProxyERC20pYFI: "MultiCollateralPynth",
    ProxyERC20pSOL: "MultiCollateralPynth",
    ProxyERC20pMATIC: "MultiCollateralPynth",
    ProxyERC20pOP: "MultiCollateralPynth",
    ProxyERC20pATOM: "MultiCollateralPynth",
    ProxyERC20pGLMR: "MultiCollateralPynth",
    ProxyERC20pAPT: "MultiCollateralPynth",
    ProxyERC20pADA: "MultiCollateralPynth",
    ProxyERC20pBCH: "MultiCollateralPynth",
    ProxyERC20pDOGE: "MultiCollateralPynth",
    ProxyERC20pGRT: "MultiCollateralPynth",
    ProxyERC20pLTC: "MultiCollateralPynth",
    ProxyERC20pGBP: "MultiCollateralPynth",
    ProxyERC20pJPY: "MultiCollateralPynth",
    ProxyERC20pCHF: "MultiCollateralPynth",
    ProxyERC20pCAD: "MultiCollateralPynth",
    ProxyERC20pAUD: "MultiCollateralPynth",
    ProxyERC20pNZD: "MultiCollateralPynth",
    ProxyERC20pPAXG: "MultiCollateralPynth",
    ProxyERC20pSHIB: "MultiCollateralPynth",
    ProxyERC20pXAU: "MultiCollateralPynth",
    ProxyERC20pXAG: "MultiCollateralPynth",
    ProxyERC20pNEAR: "MultiCollateralPynth",
    ProxyERC20pFET: "MultiCollateralPynth",
    ProxyERC20pDPI: "MultiCollateralPynth",
    ProxyERC20pEOS: "MultiCollateralPynth",
    ProxyERC20pFTM: "MultiCollateralPynth",
    ProxyERC20pICP: "MultiCollateralPynth",
};

type Contracts = {
    chainId: number;
    sources?: any;
    BridgeStatepUSD?: any;
    BridgeState?: any;
    ExchangeRates?: any;
    Exchanger?: any;
    PeriFinance?: any;
    pUSD?: any;
    SystemSettings?: any;
    provider: any;
    init: (networkId: number) => Promise<Contracts> | null;
    connect: (provider:any, address: string) => Promise<boolean>;
    clear: () => void;
    signer: any;
    signers?: {
        Exchanger?: any;
        ExchangeRates?: any;
        BridgeState?: any;
        PeriFinance?: any;
        SystemSettings?: any;
        pUSD?: any;
    };
    addressList?: any;
};

export const contracts: Contracts = {
    chainId: 0,
    signer: undefined,
    signers: {},
    provider: null,
    async init(networkId) {
        console.log("init", networkId);
        try {
            if (isNaN(networkId) || networkId === 0 || networkId === undefined) {
                return null;
            }
            this.chainId = networkId;

            const provider = new providers.JsonRpcProvider(RPC_URLS[this.chainId], this.chainId);

            this.sources = perifinance.getSource({
                network: SUPPORTED_NETWORKS[this.chainId]?.toLowerCase(),
                contract: null,
                path: null,
                fs: null,
                deploymentPath: null,
            });
            this.addressList = perifinance.getTarget({
                network: SUPPORTED_NETWORKS[this.chainId]?.toLowerCase(),
                contract: null,
                path: null,
                fs: null,
                deploymentPath: null,
            });

            console.log("init", this.addressList);

            await Promise.all(Object.keys(this.addressList).map((name) => {
                if (naming[name]) {
                    const source =
                        typeof naming[name] === "string"
                            ? this.sources[naming[name]]
                            : this.sources[naming[name][this.chainId]];

                    this[name] = new ethers.Contract(
                        this.addressList[name].address,
                        source ? source.abi : ERC20.abi,
                        provider
                    );
                    if (name === "ProxyERC20") {
                        this["PeriFinance"] = this[name];
                    }
                    if (name === "ProxyERC20pUSD") {
                        this["pUSD"] = this[name];
                    }
                }

                return naming[name];
            }));
        } catch (e) {
            console.error("contract init ERROR:", e);
            return null;
        }

        return this;
    },

    async connect(provider, address) {
        // console.log("connect", this.addressList);
        if (this.addressList === undefined) return false;

        // console.log("connect", provider, address);

        try {
            this.provider = new providers.Web3Provider(provider);
            this.signer = this.provider.getSigner(address);
            if (this.signer === undefined) {
                return false;
            }

            // console.log("signer", this.signer);
            await Promise.all(Object.keys(this.addressList).map((name) => {
                if (naming[name]) {
                    const source =
                        typeof naming[name] === "string"
                            ? this.sources[naming[name]]
                            : this.sources[naming[name][this.chainId]];
                    this.signers[name] = new ethers.Contract(
                        this.addressList[name].address,
                        source ? source.abi : ERC20.abi,
                        this.signer
                    );
                    if (name === "ProxyERC20") {
                        this.signers["PeriFinance"] = this.signers[name];
                    }

                    if (name === "ProxyERC20pUSD") {
                        this.signers["pUSD"] = this.signers[name];
                    }

                    // console.debug("connect contracts", this.signers[name])
                    return this.signers[name];
                }

                return null;
            }));
            /* setIsAppReady();
            IsContractsReady = true; */
        } catch (e) {
            console.error("contract connect ERROR:", e);
            return false;
        }
        return true;
        // console.log("contract connect", this.signers);
    },
    clear() {
        this.signer = null;
        this.signers = {};
        this.wallet = null;
        this.provider = null;
    },
};

let isContractsReady = false;

export declare type useContractsT = () => [{
    contracts: Contracts;
    IsContractsReady: boolean;
    web3Provider?: any;
}, (networkId:number) => Promise<void>, (provider:any, address: string) => Promise<void>, () => void];

export const useContracts : useContractsT = () => {
    const [contract, setContracts] = useState({ contracts: contracts, IsContractsReady: isContractsReady });
    const [web3Provider, setWeb3Provider] = useState<any>(contracts.provider);

    const initContracts = async (networkId:number) => {
        contracts.init(networkId).then((res) => {
            setContracts({ contracts: res, IsContractsReady: false });
        });
    };

    const connctContract = async (provider:any, address: string) => {
        // ethersPrivider = provider;
        const res = await contracts.connect(provider, address);
        console.log("res", res, contracts.signers);
        if (res) {
            setWeb3Provider(contracts.provider);
            setContracts({ contracts: contracts, IsContractsReady: true });
        } else {
            setContracts({ contracts: null, IsContractsReady: false });
        }
    };

    const clearContracts = () => {
        contracts.clear();
        setContracts({ contracts: null, IsContractsReady: false });
    };

    useEffect(() => {
        isContractsReady = contract.IsContractsReady
    }, [contract]);

    return [{...contract, web3Provider}, initContracts, connctContract, clearContracts];
};
