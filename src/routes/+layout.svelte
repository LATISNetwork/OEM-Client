<script lang="ts">
	import { onMount } from 'svelte';
	import "../app.css";
	let ready: boolean = false;
	import "../shims-buffer";
	onMount(() => (ready = true));
</script>


{#if ready}
	<slot />
{/if}
