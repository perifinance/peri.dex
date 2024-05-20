import { SwapWidget, darkTheme, Theme } from '@uniswap/widgets'
import '@uniswap/widgets/fonts.css'
import { contracts } from 'lib';

import { RPC_URLS } from 'lib/rpcUrl/rpcUrl';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import { RootState } from 'reducers'

const tokenList = [
	{
		"name": "Dai Stablecoin",
		"address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
		"symbol": "DAI",
		"decimals": 18,
		"chainId": 1,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
	},
		{
		"name": "Tether USD",
		"address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
		"symbol": "USDT",
		"decimals": 6,
		"chainId": 1,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
	},
	{
		"name": "USD Coin",
		"address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
		"symbol": "USDC",
		"decimals": 6,
		"chainId": 1,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
	},
	{
		"name": "Peri Finance",
		"address": "0x5d30aD9C6374Bf925D0A75454fa327AACf778492",
		"symbol": "PERI",
		"decimals": 18,
		"chainId": 1,
		"logoURI": "https://dex.peri.finance/images/tokens/peri.png"
	},
	{
		"name": "Pynth pUSD",
		"address": "0x0A51952e61a990E585316cAA3d6D15C8d3e55976",
		"symbol": "pUSD",
		"decimals": 18,
		"chainId": 1,
		"logoURI": "https://dex.peri.finance/images/tokens/pusd.png"
	},
	{
		"name": "Dai Stablecoin",
		"address": "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
		"symbol": "DAI",
		"decimals": 18,
		"chainId": 56,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
	},
		{
		"name": "Tether USD",
		"address": "0x55d398326f99059ff775485246999027b3197955",
		"symbol": "USDT",
		"decimals": 18,
		"chainId": 56,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
	},
	{
		"name": "USD Coin",
		"address": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
		"symbol": "USDC",
		"decimals": 18,
		"chainId": 56,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
	},
	{
		"name": "Peri Finance",
		"address": "0xb49B7e0742EcB4240ffE91661d2A580677460b6A",
		"symbol": "PERI",
		"decimals": 18,
		"chainId": 56,
		"logoURI": "https://dex.peri.finance/images/tokens/peri.png"
	},
	{
		"name": "Pynth pUSD",
		"address": "0xc9363d559D2e6DCAc6955A00B47d28326e07Cf07",
		"symbol": "pUSD",
		"decimals": 18,
		"chainId": 56,
		"logoURI": "https://dex.peri.finance/images/tokens/pusd.png"
	},
	{
		"name": "Dai Stablecoin",
		"address": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
		"symbol": "DAI",
		"decimals": 18,
		"chainId": 137,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
	},
		{
		"name": "Tether USD",
		"address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
		"symbol": "USDT",
		"decimals": 6,
		"chainId": 137,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
	},
	{
		"name": "USD Coin",
		"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"decimals": 6,
		"chainId": 137,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
	},
	{
		"name": "Peri Finance",
		"address": "0xDC0E17eAE3B9651875030244b971fa0223a1764f",
		"symbol": "PERI",
		"decimals": 18,
		"chainId": 137,
		"logoURI": "https://dex.peri.finance/images/tokens/peri.png"
	}
	,
	{
		"name": "Pynth pUSD",
		"address": "0xA590C980050d934c046920f8a9e0d9567536eDce",
		"symbol": "pUSD",
		"decimals": 18,
		"chainId": 137,
		"logoURI": "https://dex.peri.finance/images/tokens/pusd.png"
	},
	{
		"name": "Dai Stablecoin",
		"address": "0x06e605775296e851FF43b4dAa541Bb0984E9D6fD",
		"symbol": "DAI",
		"decimals": 18,
		"chainId": 1284,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
	},
		{
		"name": "Tether USD",
		"address": "0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73",
		"symbol": "USDT",
		"decimals": 6,
		"chainId": 1284,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
	},
	{
		"name": "USD Coin",
		"address": "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
		"symbol": "USDC",
		"decimals": 6,
		"chainId": 1284,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
	},
	{
		"name": "Peri Finance",
		"address": "0xa8dA6145919B7F710cb18dE3f5093860ED960c1b",
		"symbol": "PERI",
		"decimals": 18,
		"chainId": 1284,
		"logoURI": "https://dex.peri.finance/images/tokens/peri.png"
	}
	,
	{
		"name": "Pynth pUSD",
		"address": "0xF668242f68C818e91433b22D715ede4fe7090579",
		"symbol": "pUSD",
		"decimals": 18,
		"chainId": 1284,
		"logoURI": "https://dex.peri.finance/images/tokens/pusd.png"
	},
	{
		"name": "Dai Stablecoin",
		"address": "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844",
		"symbol": "DAI",
		"decimals": 18,
		"chainId": 1285,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
	},
		{
		"name": "Tether USD",
		"address": "0xB44a9B6905aF7c801311e8F4E76932ee959c663C",
		"symbol": "USDT",
		"decimals": 6,
		"chainId": 1285,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
	},
	{
		"name": "USD Coin",
		"address": "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D",
		"symbol": "USDC",
		"decimals": 6,
		"chainId": 1285,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
	},
	{
		"name": "Peri Finance",
		"address": "0xa8dA6145919B7F710cb18dE3f5093860ED960c1b",
		"symbol": "PERI",
		"decimals": 18,
		"chainId": 1285,
		"logoURI": "https://dex.peri.finance/images/tokens/peri.png"
	}
	,
	{
		"name": "Pynth pUSD",
		"address": "0xF668242f68C818e91433b22D715ede4fe7090579",
		"symbol": "pUSD",
		"decimals": 18,
		"chainId": 1285,
		"logoURI": "https://dex.peri.finance/images/tokens/pusd.png"
	},
	{
		"name": "Dai Stablecoin",
		"address": "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
		"symbol": "DAI",
		"decimals": 18,
		"chainId": 8435,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
	},
	{
		"name": "USD Coin",
		"address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
		"symbol": "USDC",
		"decimals": 6,
		"chainId": 8435,
		"logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
	},
	{
		"name": "Peri Finance",
		"address": "0xa8dA6145919B7F710cb18dE3f5093860ED960c1b",
		"symbol": "PERI",
		"decimals": 18,
		"chainId": 8453,
		"logoURI": "https://dex.peri.finance/images/tokens/peri.png"
	}
	,
	{
		"name": "Pynth pUSD",
		"address": "0xA7e9e51eB96D41eEE7676cE09A20D4137132FACa",
		"symbol": "pUSD",
		"decimals": 18,
		"chainId": 8453,
		"logoURI": "https://dex.peri.finance/images/tokens/pusd.png"
	}
];

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
}

export default function UniswapWideget() {
	const { networkId, isConnect } = useSelector((state: RootState) => state.wallet);
	const { isReady } = useSelector((state: RootState) => state.app);
	const [periAddress, setPeriAddress] = useState('NATIVE');
	const [pUSDAddress, setPUSDAddress] = useState(undefined);
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
	useEffect(() => {
		console.log(darkTheme);
		if (!isReady || !networkId) return;
		setPeriAddress(tokenList.find(token => token.symbol === "PERI" && token.chainId === networkId)?.address);
		setPUSDAddress(tokenList.find(token => token.symbol === "pUSD" && token.chainId === networkId)?.address);
	}, [isReady, networkId]);

	return (
		<div className='w-full h-full lg:h-[82%] flex justify-center items-center'>
			<div className="Uniswap h-[50%]">
				<SwapWidget 
					/* width={"100%"} */
					theme={theme}
					provider={contracts.provider} 
					defaultInputTokenAddress={periAddress}
					defaultOutputTokenAddress={pUSDAddress}
					jsonRpcUrlMap={RPC_URLS[networkId]} 
					tokenList={tokenList} />
			</div>
		</div>
	);
}