import { Widget } from "@kyberswap/widgets";
import { providers } from "ethers";
import { useWallets, useConnectWallet } from "@web3-onboard/react";

import { useEffect, useState } from "react";
import { qTokenList, defaultTokenIn, defaultTokenOut } from "lib/tokenList";

export default function KyberswapWideget() {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

    let ethersProvider: any;

    if (wallet) {
        ethersProvider = new providers.Web3Provider(wallet.provider, "any");
    }

    const connectedWallets = useWallets();

    const [chainId, setChainId] = useState(1);

    useEffect(() => {
        if (!connectedWallets.length) return;

        const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label);
        window.localStorage.setItem("connectedWallets", JSON.stringify(connectedWalletsLabelArray));
    }, [connectedWallets, wallet]);

    useEffect(() => {
        ethersProvider?.getNetwork().then((res: any) => setChainId(res.chainId));
    }, [ethersProvider]);

    return (
        <Widget
            client="PERI Finance"
            // theme={theme}
            tokenList={![1284, 1284].includes(chainId) ? qTokenList[chainId] : undefined}
            enableRoute={true}
            enableDexes={"kyberswap-elastic,uniswapv3,uniswap"}
            provider={ethersProvider}
            defaultTokenIn={defaultTokenIn[chainId]}
            // defaultTokenOut={defaultTokenOut[chainId]}
			showDetail={true}
			showRate={true}
            title={<div>SWAP</div>}
        />
    );
}
