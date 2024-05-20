import perifinance from "@perifinance/peri-finance";

import { ethers, providers } from "ethers";

import { SUPPORTED_NETWORKS } from "../network";
import { RPC_URLS } from "../rpcUrl";
import ERC20 from "../contract/abi/ERC20.json";
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
    provider?: any;
    wallet?: any;
    BridgeStatepUSD?: any;
    BridgeState?: any;
    ExchangeRates?: any;
    Exchanger?: any;
    PeriFinance?: any;
    pUSD?: any;
    SystemSettings?: any;
    init: (networkId: number) => void;
    connect: (address: string, setIsReady: any) => void;
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
    wallet: null,
    signer: undefined,
    signers: {},
    provider: null,
    init(networkId) {
        try {
            if (isNaN(networkId) || networkId === 0 || networkId === undefined) {
                return false;
            }
            this.chainId = networkId;

            this.provider = new providers.JsonRpcProvider(RPC_URLS[this.chainId], this.chainId);

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

            Object.keys(this.addressList).forEach((name) => {
                if (naming[name]) {
                    const source =
                        typeof naming[name] === "string"
                            ? this.sources[naming[name]]
                            : this.sources[naming[name][this.chainId]];

                    this[name] = new ethers.Contract(
                        this.addressList[name].address,
                        source ? source.abi : ERC20.abi,
                        this.provider
                    );
                    if (name === "ProxyERC20") {
                        this["PeriFinance"] = this[name];
                    }
                    if (name === "ProxyERC20pUSD") {
                        this["pUSD"] = this[name];
                    }
                }
            });
        } catch (e) {
            console.error("contract init ERROR:", e);
        }
    },

    async connect(address, setIsAppReady) {
        if (this.addressList === undefined) return;

        try {
            this.signer = new providers.Web3Provider(this.wallet.provider).getSigner(address);

            if (this.signer === undefined || this.signers === null || this.signers === undefined) {
                return;
            }

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
            setIsAppReady();
        } catch (e) {
            console.error("contract connect ERROR:", e);
        }
        // console.log("contract connect", this.signers);
    },
    clear() {
        this.signer = null;
        this.signers = null;
        this.wallet = null;
        this.provider = null;
    },
};
