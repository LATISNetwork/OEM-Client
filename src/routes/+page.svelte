<script lang="ts">

	import { browser } from '$app/environment';
	import Estuary from '$lib/components/Estuary.svelte';
	const agent = window.electron ? 'Electron' : 'Browser';
	import Ledger from '$lib/components/Ledger.svelte';
	import Encrypt from '$lib/components/Encrypt.svelte';
</script>

<main>
	<div class="m-4">
		<h1>LATIS OEM Portal</h1>
		<p>Running in {agent}</p>
	</div>
	<Encrypt />
	<Estuary />
	<Ledger />

</main>
