<script lang="ts">
	import { browser } from '$app/environment';
	import Estuary from '$lib/components/Estuary.svelte';
	const agent = window.electron ? 'Electron' : 'Browser';
	import Ledger from '$lib/components/Ledger.svelte';
	import Login from '$lib/components/Login.svelte';
	import { onMount } from 'svelte';
	import { componentType, loggedIn, ComponentType } from '$lib/stores/stores';
	let ready: boolean = false;
	import '../shims-buffer';
	onMount(() => {
		ready = true;
		componentType.subscribe((value) => {
			if (value === ComponentType.LOGIN && $loggedIn == true) {
				componentType.set(ComponentType.PORTAL);
			}
		});
	});
</script>

<main class="text-sm">
	{#if $componentType === ComponentType.LEDGER}
		<Ledger />
	{:else if $componentType === ComponentType.LOGIN}
		{#if $loggedIn == true}
			<Estuary />
		{:else}
			<Login />
		{/if}
	{:else if $componentType === ComponentType.PORTAL}
		<Estuary />
	{/if}
</main>
