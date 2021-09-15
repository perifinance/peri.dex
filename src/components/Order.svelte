<script>
    import { openCoinList } from '../stores/coin/isCoinList';
    import { selectedCoins } from '../stores/coin/selectedCoins';

    let per = 0;
    let available = BigInt(1000000);
    let isError = false;
</script>

<div class="max-w-sm h-screen">
    <div class="flex py-2 justify-between w-full">
        <div class="text-gray-200">Pay</div>
        <div class="text-gray-200">Available: {available.toLocaleString()}</div>
    </div>
    <div class="flex items-center py-2 space-x-6 rounded-xl">
        <div class="flex py-3 rounded-lg text-gray-200 font-semibold cursor-pointtext-center m-auto" on:click={() => openCoinList('source')}>
            <span>{$selectedCoins.source.symbol}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>    
        
        <div class="flex bg-gray-100 py-2 w-full rounded-lg {isError && 'border border-red-500'}">
            <input class="bg-gray-100 w-full outline-none" type="text"/>
        </div>
    </div>
    <div class="flex justify-end font-medium tracking-wide text-red-500 text-xs w-full">
        {#if isError}
            <span>Invalid username field !</span>
        {/if}
        
    </div>

    
    <div class="flex py-2 justify-between w-full">
        <div class="text-gray-200">Receive(Estimated)</div>
    </div>
    
    <div class="flex items-center py-2 space-x-6 rounded-xl">
        <div class="flex py-3 rounded-lg text-gray-200 font-semibold cursor-pointtext-center m-auto">
            <span>{$selectedCoins.destination.symbol}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" on:click={() => openCoinList('destination')}>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
        <div class="flex bg-gray-200 py-2 w-full rounded-lg">
            <input class="bg-gray-200 w-full outline-none" type="text"/>
        </div>
    </div>

    <div class="py-2 w-full">
        <div class="bg-gray-300 h-2 w-full rounded-full relative">
            <span class="bg-white h-4 w-4 absolute top-0 -ml-2 -mt-1 z-10 shadow rounded-full cursor-pointer" style="{`left: ${per}%`}"></span>
            <span class="bg-blue-500 h-2 absolute left-0 top-0 rounded-full" style="{`width: ${per}%`}"></span>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-400">
            <span class="w-8 text-left" on:click={() => per = 0}>0%</span>
            <span class="w-8 text-center" on:click={() => per = 25}>25%</span>
            <span class="w-8 text-center" on:click={() => per = 50}>50%</span>
            <span class="w-8 text-center" on:click={() => per = 75}>75%</span>
            <span class="w-8 text-right" on:click={() => per = 100}>100%</span>
        </div>
    </div>

    

    <div class="flex py-2 justify-between w-full">
        <div class="text-gray-200">Network Fee(40GWEI)</div>
        <div class="text-gray-200">$0.01</div>
    </div>

    <div class="flex py-2 justify-between w-full">
        <div class="text-gray-200">Price: </div>
        <div class="text-gray-200">${BigInt(400000).toLocaleString()}</div>
    </div>

    <div class="flex py-2 justify-between w-full">
        <div class="text-gray-200">Received:</div>
        <div class="text-gray-200">{BigInt(400000).toLocaleString()}BTC</div>
    </div>

    <div class="flex py-2 justify-between w-full">
        <div class="text-gray-200">Fee(0.03%:)</div>
        <div class="text-gray-200">${BigInt(20).toLocaleString()}</div>
    </div>

    <div class="flex py-2 justify-between w-full">
        <div class="text-gray-200">Total:</div>
        <div class="text-gray-200">${BigInt(400020).toLocaleString()}</div>
    </div>

    <div class="p-6 space-x-6 rounded-xl">
        <button class="bg-blue-400 p-4 w-full rounded-lg text-center text-white" on:click={ () => isError = true}>
            Confirm
        </button>
    </div>
    
</div>