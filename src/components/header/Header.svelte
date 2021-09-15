<script>
	import { page } from '$app/stores';
	let dropdownOpen = false;
	let isConnect = false;
	
</script>

<header>
	<div class="corner">
		<a href="/">
			<img alt="Logo"/>
		</a>
	</div>
	<nav class="flex items-center w-0 justify-between sm:visible sm:w-auto">
		<ul>
			<li class="space-x-5 text-xl inline m-10" class:active={$page.path === '/'}>
				<a class="hidden sm:inline-block text-gray-700 hover:text-indigo-700" sveltekit:prefetch href="/">Home</a>
			</li>
			<li class="space-x-5 text-xl inline m-10" class:active={$page.path === '/exchage'}>
				<a class="hidden sm:inline-block text-gray-700 hover:text-indigo-700" sveltekit:prefetch href="/exchage">Exchage</a>
			</li>
			<li class="space-x-5 text-xl inline m-10" class:active={$page.path === '/assets'}>
				<a class="hidden sm:inline-block text-gray-700 hover:text-indigo-700" sveltekit:prefetch href="/assets">Assets</a>
			</li>
		</ul>
	</nav>
	
	<div class="flex py-4">
		{#if !isConnect}
		<button class="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded-full" on:click={() => isConnect = true}>
            CONNECT
		</button>
		{:else}
		<button class="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded-full">
			<div class="flex items-center">
				<span class="text-gray-400">0x82….8C7</span>
				<img class="w-4 h-4 mx-2" src="/logo/logo.png" alt="network"/>
				<span class="text-gray-200">ETH</span>
			</div>
		</button>
			
		{/if}
	</div>
	
		
	
	<div class="corner">
		<div on:click={() => dropdownOpen = !dropdownOpen} class="sm:hidden space-y-2 hover:cursor-pointer py-5">
			<span class="w-10 h-1 bg-gray-400 rounded-full block"></span>
			<span class="w-10 h-1 bg-gray-400 rounded-full block"></span>
			<span class="w-10 h-1 bg-gray-400 rounded-full block"></span>
		</div>
	</div>
	{#if dropdownOpen}
		<div class="absolute right-4 mt-14 py-2 w-32 bg-white rounded-md shadow-xl z-20">
			<a sveltekit:prefetch href="/" class="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
				Home
			</a>
			<a sveltekit:prefetch href="/exchage" class="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
				Exchage
			</a>
			<a sveltekit:prefetch href="/assets" class="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
				Assets
			</a>
		</div>
	{/if}
	
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		height: 4em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 3em;
		height: 3em;
		object-fit: contain;
		content:url("/logo/logo.png");
	}

	@media (min-width: 640px) {
		.corner {
			width: 7em;
			height: 4em;
		}

		.corner img {
			width: 6em;
			height: 3em;
			content:url("/logo/logo_pc.png");
		}
	}
</style>
