<script>
    import Order from '../components/Order.svelte';
    import CoinList from '../components/CoinList.svelte';
    import { isCoinList } from '../stores/coin/isCoinList';
    
</script>

{#if $isCoinList} 
    <CoinList></CoinList>
{:else}
    <Order></Order>
    <div>
        차트차트
    </div>
{/if}