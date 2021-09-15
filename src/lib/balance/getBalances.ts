import { contracts } from 'lib/contract'
import { utils } from 'ethers'
import { getBalance } from './getBalance'
import { formatDecimal } from 'lib'
export const getBalances = async (currentWallet, currencies, exchangeRates, targetCRatio, currentCRatio) => {
    const stakeAble: boolean = currentCRatio === 0n || currentCRatio <= 25n * BigInt(Math.pow(10, 16).toString()); //0.25;

    const {
        PeriFinance,
        ExternalTokenStakeManager,
        RewardEscrowV2,
    } = contracts as any;
    
    const USDCDecimal = contracts.networkId === 56 ? 18 : currencies['USDC'].decimal;
    const DAIDecimal = currencies['DAI'].decimal;
    
    const [
        debtBalance,
        pUSDBalance,
        USDCBalance,
        DAIBalance,
        periBalance, 
        transferablePERI, 
        PERIRewardEscrow
    ] = await Promise.all([
        (async() => BigInt((await PeriFinance.debtBalanceOf(currentWallet, utils.formatBytes32String('pUSD')))))(),
        await getBalance(currentWallet, 'PynthpUSD', currencies['pUSD'].decimal),
        await getBalance(currentWallet, 'USDC', USDCDecimal),
        await getBalance(currentWallet, 'DAI', DAIDecimal),
        (async() => BigInt((await PeriFinance.collateral(currentWallet))))(),
        (async() => BigInt((await PeriFinance.transferablePeriFinance(currentWallet))))(),
        (async() => BigInt((await RewardEscrowV2.balanceOf(currentWallet))))(),
    ])

    let USDCAllowance, DAIAllowance, LPAllowance = 0n;

    if(pUSDBalance > 0n) {
        USDCAllowance = formatDecimal(BigInt((await contracts['USDC'].allowance(currentWallet, contracts?.addressList['ExternalTokenStakeManager'].address)).toString()), USDCDecimal);
    }
    if(USDCBalance > 0n) {
        DAIAllowance = formatDecimal(BigInt((await contracts['DAI'].allowance(currentWallet, contracts?.addressList['ExternalTokenStakeManager'].address)).toString()), DAIDecimal);
    }

    if(DAIBalance > 0n) {
        LPAllowance = contracts['LP'] ? BigInt((await contracts['LP'].allowance(currentWallet)).toString()) : 0n
    }

    let [
        LPBalance,
        LPRewardEscrow,
        stakedLP,
    ] = contracts['LP'] ? await Promise.all([
        await getBalance(currentWallet, 'LP', currencies['LP'].decimal),
        (async() => BigInt((await contracts['LP'].earned(currentWallet))))(),
        (async() => BigInt((await contracts['LP'].stakedAmountOf(currentWallet))))()
    ]) : [0n, 0n, 0n]

    
    let [stakedUSDC, stakedDAI] = debtBalance > 0n ? await Promise.all([
        (async() => BigInt((await ExternalTokenStakeManager.stakedAmountOf(currentWallet, utils.formatBytes32String('USDC'), utils.formatBytes32String('USDC')))))(),
        (async() => BigInt((await ExternalTokenStakeManager.stakedAmountOf(currentWallet, utils.formatBytes32String('DAI'), utils.formatBytes32String('DAI')))))(),
    ]) : [0n, 0n, 0n, 0n, 0n];

    
    let USDCDEBT, DAIDEBT, stableDEBT, PERIDEBT, mintableStable, USDCStakable, DAIStakable, PERIStaked, PERIStakable: bigint = 0n;

    try {
        USDCDEBT = (BigInt(stakedUSDC) * exchangeRates['USDC'] / BigInt(Math.pow(10, 18).toString()) / (BigInt(Math.pow(10, 18).toString()) / targetCRatio));
        DAIDEBT = (BigInt(stakedDAI) * exchangeRates['DAI'] / BigInt(Math.pow(10, 18).toString()) / (BigInt(Math.pow(10, 18).toString()) / targetCRatio));
        stableDEBT = USDCDEBT + DAIDEBT;
        PERIDEBT = debtBalance - stableDEBT;

        mintableStable = ((PERIDEBT / 4n) - (stableDEBT));
        mintableStable = mintableStable <= 0n ? 0n : mintableStable;
        USDCStakable = stakeAble ? mintableStable * (BigInt(Math.pow(10, 18).toString()) / targetCRatio) * BigInt(Math.pow(10, 18).toString()) / exchangeRates['USDC'] : 0n
        DAIStakable = stakeAble ? mintableStable * (BigInt(Math.pow(10, 18).toString()) / targetCRatio) * BigInt(Math.pow(10, 18).toString()) / exchangeRates['DAI'] : 0n
        
        if(USDCStakable > USDCBalance) {
            USDCStakable = USDCBalance;
        }

        if(DAIStakable > DAIBalance) {
            DAIStakable = DAIBalance;
        }

        PERIStaked = PERIDEBT * (BigInt(Math.pow(10, 18).toString()) / targetCRatio) * BigInt(Math.pow(10, 18).toString()) / exchangeRates['PERI'];
        PERIStaked = periBalance < PERIStaked ? periBalance : PERIStaked;
        PERIStakable = BigInt(periBalance) - PERIStaked;
        PERIStakable = PERIStakable <= 0n ? 0n : PERIStakable;
    } catch(e) {
        console.log(e);
    }
    
    
    return {
        DEBT: {
            ...currencies['DEBT'],
            balance: debtBalance,
            transferable: 0n,
            USDC: USDCDEBT,
            DAI: DAIDEBT,
            PERI: PERIDEBT,
            stable: stableDEBT,
            
        },
        PERI: {
            ...currencies['PERI'],
            balance: periBalance,
            staked: PERIStaked,
            stakable: PERIStakable,
            transferable: transferablePERI,
            rewardEscrow: PERIRewardEscrow,
            
        },
        pUSD: {
            ...currencies['pUSD'],
            balance: pUSDBalance,
            transferable: pUSDBalance,
            
        },
        USDC: {
            ...currencies['USDC'],
            balance: USDCBalance + stakedUSDC,
            transferable: USDCBalance,
            staked: stakedUSDC,
            stakable: USDCStakable,
            mintable: stakeAble ? mintableStable : 0n,
            allowance: USDCAllowance,
            
        },
        DAI: {
            ...currencies['DAI'],
            balance: DAIBalance + stakedDAI,
            transferable: DAIBalance,
            staked: stakedDAI,
            mintable: stakeAble ? mintableStable : 0n,
            stakable: DAIStakable,
            allowance: DAIAllowance,
            
        },
        LP: {
            ...currencies['LP'],
            balance: LPBalance + stakedLP,
            transferable: LPBalance,
            allowance: LPAllowance,
            staked: stakedLP,
            stakable: LPBalance,
            rewardEscrow: LPRewardEscrow,
        },
    }
}