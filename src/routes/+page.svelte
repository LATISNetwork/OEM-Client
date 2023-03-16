<script lang="ts">

	import { browser } from '$app/environment';

	const agent = window.electron ? 'Electron' : 'Browser';
</script>

<main>
	<div class="m-4">
		<h1>LATIS OEM Portal</h1>
		<p>Running in {agent}</p>
	</div>
	

</main>
