// import { SwapWidget, darkTheme, Theme } from '@uniswap/widgets'
import '@uniswap/widgets/fonts.css'
import { providers } from 'ethers';
import { contracts } from 'lib';

import { RPC_URLS } from 'lib/rpcUrl/rpcUrl';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import { RootState } from 'reducers'
import { tokenList } from 'lib/tokenList';
/* 
const theme: Theme = {
	"accent": "hsl(221, 96%, 64%)",
	"accentSoft": "rgba(75,131,251,0.24)",
	"container": "#031432",
	"module": "#042044", //"#021437", //"hsl(222, 37%, 12%)",
	"interactive": "#053053", //hsla(223, 28%, 22%, 1)",
	"outline": "hsl(224, 33%, 16%)",
	"dialog": "hsl(0, 0%, 0%)",
	"scrim": "hsla(224, 33%, 16%, 0.5)",
	"onAccent": "hsl(0, 0%, 100%)",
	"primary": "hsl(0, 0%, 100%)",
	"secondary": "hsl(227, 21%, 67%)",
	"hint": "hsla(225, 18%, 44%)",
	"onInteractive": "hsl(0, 0%, 100%)",
	"deepShadow": "hsla(0, 0%, 0%, 0.32), hsla(0, 0%, 0%, 0.24), hsla(0, 0%, 0%, 0.24)",
	"networkDefaultShadow": "hsla(221, 96%, 64%, 0.16)",
	"active": "hsl(221, 96%, 64%)",
	"activeSoft": "hsla(221, 96%, 64%, 0.24)",
	"success": "hsl(145, 63.4%, 41.8%)",
	"warningSoft": "hsla(44, 86%, 51%, 0.24)",
	"critical": "#FA2B39",
	"criticalSoft": "rgba(250, 43, 57, 0.12);",
	"warning": "hsl(44, 86%, 51%)",
	"error": "hsla(5, 97%, 71%, 1)",
	"currentColor": "currentColor"
} */
interface ProviderMessage {
	type: string;
	data: unknown;
}

export default function UniswapWidget() {
	const { networkId, address } = useSelector((state: RootState) => state.wallet);
	const { isReady } = useSelector((state: RootState) => state.app);
	const [periAddress, setPeriAddress] = useState('NATIVE');
	const [pUSDAddress, setPUSDAddress] = useState(undefined);
	const [provider, setProvider] = useState(undefined);
/* 	const theme: Theme = {
		interactive: '#042044',
		container: '#042044',
		module: '#FFF',
		accent: '#FD5B00',
		outline: '#1E4D3C',
		dialog: '#000',
		fontFamily: 'Montserrat',
	};
 */

	const onWidgetError = (error: Error) => {
		console.error(error);
	}
	useEffect(() => {
		// console.log(darkTheme);
		if (!isReady || !networkId) return;
		setPeriAddress(tokenList.find(token => token.symbol === "PERI" && token.chainId === networkId)?.address);
		setPUSDAddress(tokenList.find(token => token.symbol === "pUSD" && token.chainId === networkId)?.address);

		
		try {
			const web3Provider = new providers.Web3Provider(contracts.provider);
			setProvider(web3Provider);
		} catch (err) {
			console.error(err);
		}

		contracts.provider.on(
			'message',
			(message: ProviderMessage) => {
				console.log('message', message);
			}
		);

		// setProvider(contracts.provider);
	}, [isReady, networkId, address]);

	return (
		<div className='w-full h-full lg:h-[82%] flex justify-center items-center'>
			<div className="Uniswap h-[50%]">
				{/* <SwapWidget 
					width={"100%"}
					theme={theme}
					// defaultChainId={Number(networkId)}
					onError={onWidgetError}
					hideConnectionUI={true}
					// provider={provider} 
					defaultInputTokenAddress={periAddress}
					defaultOutputTokenAddress={pUSDAddress}
					// jsonRpcUrlMap={RPC_URLS[networkId]} 
					// tokenList={tokenList} 
				/> */}
			</div>
		</div>
	);
}