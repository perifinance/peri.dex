# PERI.Staking
[![Discord](https://img.shields.io/discord/818411536900030486.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discord.com/channels/818411536900030486/)
[![Twitter Follow](https://img.shields.io/twitter/follow/PERIFinance.svg?label=PERIfinance&style=social)](https://twitter.com/PERIfinance)
[![Chat on Telegram](https://img.shields.io/badge/Join-Telegram-brightgreen.svg)](https://t.me/peri_global)  
This is the code for the `PERI.Staking` dApp: "http://staking.peri.finance/"
The dApp communicates with the [Peri Finance contracts](https://docs.peri.finance), allowing users to perform the following actions:
- Mint (aka Issue) `pUSD` by locking `PERI` or `USDC`
- Claim rewards of both `PERI` (inflation) 
- Burn `pUSD` to unlock `PERI` and `USDC`
- Transfer `PERI` to other accounts
## In the future
- Can claim rewards of `pUSD` (exchange fees) every week
- Deposit (or withdrawl) `pUSD` into the `Depot` contract, to go in the queue for exchanging with `ETH` at current market price
`PERI.Staking` supports the following wallet providers:
- Metamask
- Trezor (Coming soon)
- Ledger (Coming soon)
- Coinbase Wallet (Coming soon)
![PERI.Staking](http://test.peri.finance/file/staking.png)
## Available Scripts
In the project directory, you can run:
### `npm start`
Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits.<br>
You will also see any lint errors in the console.
### `npm test`
Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
### `npm run build`
Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!
See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.