<script>
    import Header from '$lib/header/Header.svelte';
    import "../app.postcss";
</script>

<div class="dark:bg-gray-900">
    <div class="container mx-auto px-4">
        <Header></Header>
        <slot></slot>
    </div>
</div>
