<script>
    import { onMount } from 'svelte';
    import { coinList, setCoinList, setFavorite } from '../stores/coin/coinList';
    import { isCoinList, closeCoinList } from '../stores/coin/isCoinList';
    import pynthsCategories from '../configure/coins/pynthsCategories'
    import { selectCoin } from '../stores/coin/selectedCoins'

    onMount(() => {
		setCoinList();
	});
</script>

<div class="w-full">
    <div class="flex">
        <div class="w-full max-w-md">
            <div class="mb-4">
                <div class="flex flex-row-reverse">
                    <button type="button" class="rounded-md py-1 inline-flex items-center justify-center text-gray-400 hover:text-gray-500" on:click={() => isCoinList.set(false)}>
                        <!-- Heroicon name: outline/x -->
                        <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="flex items-center bg-gray-200 rounded-md">
                    <div class="pl-2">
                        <svg class="fill-current text-gray-500 w-6 h-6" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24">
                            <path class="heroicon-ui"
                                d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                        </svg>
                    </div>
                    <input
                        class="w-full rounded-md bg-gray-200 text-gray-700 leading-tight focus:outline-none py-2 px-2"
                        type="text" placeholder="Enter the token symbol or name">
                </div>
                <nav class="flex flex-row-reverse">
                    <button class="w-1/6 text-gray-600 px-3 block hover:text-blue-500 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div class="flex overflow-hidden">
                        {#each pynthsCategories as category, index}
                            <button class="text-gray-600 py-4 px-2 block hover:text-blue-500 focus:outline-none border-b-2 font-medium border-blue-500">
                                {category}
                            </button>    
                        {/each}
                    </div>
                    
                </nav>
                <div class="py-3 text-sm">
                    {#if $coinList} 
                        {#each $coinList as currency, index}
                            <div class="flex justify-start cursor-pointer text-gray-200 hover:bg-gray-800 rounded-md px-2 py-2 my-2" on:click={ () => {selectCoin(currency); closeCoinList();}}>
                                <div on:click|stopPropagation={ () => setFavorite(index)}>
                                    <svg class="w-6 h-6 fill-current {currency.favorite ? 'text-yellow-500' : 'text-gray-500'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                </div>
                                <img class="w-6 h-6 mx-2" src="/logo/logo.png" alt="network"/>
                                <div class="flex-grow font-medium px-2">{currency.symbol}</div>
                                <div class="text-sm font-normal text-gray-500 tracking-wide">{currency.name}</div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>