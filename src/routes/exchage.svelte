<script>
    let per = 0;
    let available = 1000000n;
    let isError = false;
</script>


<div>
    <div class="flex px-6 py-2 justify-between w-full">
        <div>Pay</div>
        <div>Available: {available.toLocaleString()}</div>
    </div>
    <div class="flex items-center p-2 space-x-6 rounded-xl">
        <div class="flex py-3 px-4 rounded-lg text-gray-500 font-semibold cursor-pointtext-center m-auto">
            <span>pBTC</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>    
        
        <div class="flex bg-gray-100 p-2 w-full space-x-4 rounded-lg {isError && 'border border-red-500'}">
            <input class="bg-gray-100 w-full outline-none" type="text"/>
        </div>
    </div>
    <div class="flex px-6 justify-end font-medium tracking-wide text-red-500 text-xs w-full">
        {#if isError}
            <span>Invalid username field !</span>
        {/if}
        
    </div>

    
    <div class="flex px-6 py-2 justify-between w-full">
        <div>Receive(Estimated)</div>
    </div>
    
    <div class="flex items-center p-2 space-x-6 rounded-xl">
        <div class="flex py-3 px-4 rounded-lg text-gray-500 font-semibold cursor-pointtext-center m-auto">
            <span>pUSD</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
        <div class="flex bg-gray-100 p-2 w-full space-x-4 rounded-lg">
            <input class="bg-gray-100 w-full outline-none" type="text"/>
        </div>
    </div>

    <div class="px-6 py-2 w-full">
        <div class="bg-gray-300 h-2 w-full rounded-full relative">
            <span class="bg-white h-4 w-4 absolute top-0 -ml-2 -mt-1 z-10 shadow rounded-full cursor-pointer" style="{`left: ${per}%`}"></span>
            <span class="bg-blue-500 h-2 absolute left-0 top-0 rounded-full" style="{`width: ${per}%`}"></span>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-600">
            <span class="w-8 text-left" on:click={() => per = 0}>0%</span>
            <span class="w-8 text-center" on:click={() => per = 25}>25%</span>
            <span class="w-8 text-center" on:click={() => per = 50}>50%</span>
            <span class="w-8 text-center" on:click={() => per = 75}>75%</span>
            <span class="w-8 text-right" on:click={() => per = 100}>100%</span>
        </div>
    </div>

    

    <div class="flex px-6 py-2 justify-between w-full">
        <div>Network Fee(40GWEI)</div>
        <div>$0.01</div>
    </div>

    <div class="flex px-6 py-2 justify-between w-full">
        <div>Price: </div>
        <div>${400000n.toLocaleString()}</div>
    </div>

    <div class="flex px-6 py-2 justify-between w-full">
        <div>Received:</div>
        <div>{400000n.toLocaleString()}BTC</div>
    </div>

    <div class="flex px-6 py-2 justify-between w-full">
        <div>Fee(0.03%:)</div>
        <div>${20n.toLocaleString()}</div>
    </div>

    <div class="flex px-6 py-2 justify-between w-full">
        <div>Total:</div>
        <div>${400020n.toLocaleString()}</div>
    </div>

    <div class="p-6 space-x-6 rounded-xl">
        <button class="bg-blue-400 p-4 w-full space-x-4 rounded-lg text-center text-white" on:click={ () => isError = true}>
            Confirm
        </button>
    </div>
    
</div>