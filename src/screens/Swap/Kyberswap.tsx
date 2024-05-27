import { Widget } from "@kyberswap/widgets";
import { providers } from "ethers";
import { useConnectWallet } from "lib/onboard";

import { useEffect, useState } from "react";
import { qTokenList, defaultTokenIn } from "lib/tokenList";
import { useMediaQuery } from "react-responsive";
// import { useContracts } from "lib";

export default function KyberswapWideget() {
    const isNarrowMobile = useMediaQuery({ query: `(max-width: 360px)` });
    const [{ wallet }] = useConnectWallet();
    const [inToken, setInToken] = useState();
    // const [outToken, setOutToken] = useState(undefined);
    const [chainId, setChainId] = useState(1);
    // const [{ web3Provider }] = useContracts();
    const [ethersProvider, setEthersProvider] = useState<any>();
    const [enableRoute, setEnableRoute] = useState(false);
    const [periTokens, setPeriTokens] = useState([]);

    const onError = (error: any) => {
        console.log("Swap error", error);
    }
    useEffect(() => {
        if (wallet) {
            console.log("Swap wallet", wallet);
            const ethersProvider = new providers.Web3Provider(wallet.provider, "any");
            setEthersProvider(ethersProvider);
        }
    }, [wallet]);

    useEffect(() => {
        console.log("Swap ethersProvider", ethersProvider);
        ethersProvider?.getNetwork().then((res: any) => setChainId(res.chainId));
    }, [ethersProvider]);

    useEffect(() => {
        console.log("Swap chainId", chainId);
        const list = ![1284, 1284].includes(chainId) ? qTokenList[chainId] : []
        setPeriTokens(list);
    }, [chainId]);

    useEffect(() => {
        setInToken(defaultTokenIn[chainId]);
        
        // setOutToken(defaultTokenOut[chainId]);
        setEnableRoute(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periTokens]);

    useEffect(() => {
        const footer = document.querySelectorAll('.sc-EJAja');
        footer.forEach((e) => {
            e.remove();
        });
    }, []);

    return (
        <Widget
            client="PERI Finance"
            width={isNarrowMobile?320:360}
            theme={theme}
            tokenList={periTokens}
            enableRoute={enableRoute}
            enableDexes={"kyberswap-elastic,uniswapv3,uniswap,quickswap,quickswap-v3,pancake,pancake-v3,pancake-legacy"}
            provider={ethersProvider}
            defaultTokenIn={inToken}
            // defaultTokenOut={outToken}
			showDetail={true}
			showRate={true}
            onError={onError}
            title={"SWAP"}
        />
    );

};

const theme = {
    primary: '#042044',
    secondary: '#020e2f',
    text: '#bccde2',
    subText: '#A9A9A9',
    interactive: '#063256',
    dialog: '#063256',
    stroke: '#505050',
    accent: '#13ddfd',
    success: '#189470',
    warning: '#FF9901',
    error: '#F84242',
    fontFamily: 'Montserrat',
    borderRadius: '10px',
    buttonRadius: '6px',
    boxShadow: '0px 4px 4px rgba(10, 10, 10, 0.04)',
};
