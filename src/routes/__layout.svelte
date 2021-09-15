<script>
    import { onMount } from 'svelte';
    import Header from '../components/header/Header.svelte';
    import "../app.postcss";
    // import Onboard from 'bnc-onboard'
    
    // import { InitOnboard, onboard } from '$lib/onboard/onboard'
    // onMount(() => {
    //     InitOnboard(80001);
    // })
    
</script>

<div class="dark:bg-gray-900">
    <div class="container mx-auto px-4">
        <Header></Header>
        <slot></slot>
    </div>
</div>
