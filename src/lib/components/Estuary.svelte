<script lang="ts">
	let pathToFile = '';
	let name = '';
	let fileDescription = '';
	let deviceID = '';
	let version = '';
	let response = '';
	let file: HTMLInputElement;
	let error = '';
	let uploadLoading = false;
	let manuID = 'LatisManu';
	import Icon from '@iconify/svelte';
	import { componentType, loggedIn, ComponentType } from '$lib/stores/stores';

	import fs from 'fs';
	import { onMount } from 'svelte';
	let updateListJson: any[] = [];

	const uploadFile = async () => {
		if (!file.files || !file.files[0]) {
			error = 'Please select a file';
			return;
		}
		if (!name) {
			error = 'Please enter a file name';
			return;
		}
		if (!deviceID) {
			error = 'Please enter a device ID';
			return;
		}
		if (!version) {
			error = 'Please enter a version';
			return;
		}
		if (!fileDescription) {
			error = 'Please enter a file description';
			return;
		}

		let formData = new FormData();
		formData.append('file', file.files[0]);
		formData.append('name', name);
		uploadLoading = true;
		const res = await fetch('api/upload', {
			method: 'POST',
			body: formData,
		});
		const resAwait = await res;
		if (!resAwait.ok) {
			error = resAwait.statusText;
			return;
		}
		console.log(res);
		const responseJson = await res.json();

		console.log(responseJson);
		if (responseJson.error) {
			error = responseJson.error;
			return;
		}
		console.log(responseJson);
		const output = JSON.parse(responseJson.output);
		const cid = await output.cid;
		const url = await output.retrieval_url;
		console.log(cid);
		if (!cid) {
			error = 'Error uploading file';
			return;
		} else {
			console.log('cid: ' + cid);
			const addUpdate = await fetch('/api/add-update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					name,
					fileDescription,
					deviceID,
					version,
					cid,
					url,
				}),
			});
			if (!addUpdate.ok) {
				error = await addUpdate.text();
				return;
			}

			// HERE ADD SMART CONTRACT, AFTER ASYNC CALL FINISHES, THEN UPDATE THE STUFF BELOW

			response = responseJson.output;
			name = '';
			fileDescription = '';
			deviceID = '';
			version = '';
			file.value = '';
			uploadLoading = false;
			updateUpdateList();
		}
	};
	const logout = async () => {
		// Clear cookies
		const signout_res = await fetch(`/api/signout`, {
			method: 'POST',
			headers: new Headers({ 'Content-Type': 'application/json' }),
			credentials: 'same-origin',
		});

		if (!signout_res.ok) {
			error = await signout_res.text();
			console.log(error);
		} else {
			// console.log(signout_res);
			componentType.set(ComponentType.LEDGER);
			loggedIn.set(false);
			window.location.reload();
		}
	};

	const pushUpdate = (
		manuID: string,
		name: string,
		d_id: string,
		version: string,
		cid: string,
		url: string,
	) => {
		console.log(name);
		console.log(d_id);
		console.log(version);
		console.log(cid);
		console.log(url);
		// DO AN API CALL HERE
		// DO A SMART CONTRACT CALL TOO
	};

	const updateUpdateList = async () => {
		const updateList = await fetch('/api/get-updates', {
			method: 'POST',
			headers: new Headers({ 'Content-Type': 'application/json' }),
			credentials: 'same-origin',
		});
		const updateListJsonAwait = await updateList.json();
		console.log(updateListJsonAwait[0].updates[0]);
		for (let i = 0; i < updateListJsonAwait.length; i++) {
			for (let j = 0; j < updateListJsonAwait[i].updates.length; j++) {
				updateListJson = [
					...updateListJson,
					{
						name: updateListJsonAwait[i].updates[j].name,
						fileDescription: updateListJsonAwait[i].updates[j].fileDescription,
						deviceID: updateListJsonAwait[i].updates[j].deviceID,
						version: updateListJsonAwait[i].updates[j].version,
						cid: updateListJsonAwait[i].updates[j].cid,
						url: updateListJsonAwait[i].updates[j].url,
					},
				];
			}
		}
	};

	onMount(async () => {
		updateUpdateList();
	});
</script>

<div class="flex flex-row h-screen w-screen">
	<div
		class="m-4 bg-emerald-500 bg-opacity-10 rounded-lg shadow-md p-8 flex flex-col w-1/3 max-h-full overflow-y-auto"
	>
		<div class="w-full flex flex-row justify-between align-middle my-4">
			<h1 class="text-2xl text-emerald-300 font-bold">LATIS OEM Client</h1>
			<button
				on:click={logout}
				class=" border-emerald-500 border-2 rounded-md px-4 py-2 w-1/6 hover:bg-emerald-900 hover:bg-opacity-50 transition-all"
			>
				Log out
			</button>
		</div>
		<h1 class="text-xl">Update a Device</h1>
		<h1>{pathToFile}</h1>
		<div class="mt-4 flex flex-col justify-center">
			<input
				type="file"
				id="file"
				name="file"
				placeholder="Select a file"
				bind:this={file}
				on:input={() => {
					name = file.files[0].name;
				}}
				disabled={uploadLoading}
				class="py-8 px-4 mt-2 block w-full  focus:ring-emerald-400 bg-black bg-opacity-40 border-emerald-900 rounded-lg font-medium border-2 border-dashed hover:cursor-pointer"
			/>
		</div>

		<div class="mt-4  flex flex-col w-1/3">
			<label for="file" class="mr-4">File Name:</label>
			<input
				type="text"
				id="name"
				name="name"
				placeholder="Enter a file name"
				disabled={uploadLoading}
				class=" bg-black bg-opacity-30 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md p-4 placeholder:italic"
				bind:value={name}
			/>
		</div>
		<div class="mt-4  flex flex-col w-1/3">
			<label for="file" class="mr-4">Target Device ID:</label>
			<input
				type="text"
				name="name"
				placeholder="Ex. 0.0.raspberry_pi_4"
				disabled={uploadLoading}
				class=" bg-black bg-opacity-30 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md p-4 placeholder:italic"
				bind:value={deviceID}
			/>
		</div>
		<div class="mt-4  flex flex-col w-1/3">
			<label for="file" class="mr-4">Update Version:</label>
			<input
				type="text"
				name="version"
				disabled={uploadLoading}
				placeholder="Ex. v023842.8"
				class=" bg-black bg-opacity-30 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md p-4 placeholder:italic"
				bind:value={version}
			/>
		</div>
		<div class="mt-4 flex flex-col ">
			<label for="file" class="mr-4">Description:</label>
			<textarea
				name="description"
				disabled={uploadLoading}
				placeholder="Enter update information"
				rows="10"
				class="focus:ring-emerald-400 bg-black bg-opacity-30 border-emerald-500 focus:outline-none focus:ring-2 rounded-md p-4 placeholder:italic"
				bind:value={fileDescription}
			/>
		</div>

		<div class="mt-4">
			<button
				disabled={uploadLoading}
				class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
				on:click={uploadFile}
			>
				Upload
			</button>
		</div>
		{#if uploadLoading}
			<div class="m-4 my-auto text-emerald-400 flex flex-row mt-4">
				<Icon icon="fluent:spinner-ios-20-filled" class="animate-spin h-5 w-5 mr-3 ..." />
				<h1>Uploading! This may take a while</h1>
			</div>
		{/if}
		{#if error}
			<div class="m-4 my-auto text-red-400">
				<h1>Error</h1>
				<p>{error}</p>
			</div>
		{/if}
		{#if response}
			<div
				class=" mt-8 my-auto w-full flex-wrap text-wrap bg-black bg-opacity-60 rounded-md p-2 overflow-y-scroll overflow-x-none max-h-32"
			>
				<h1 class="text-emerald-400">Update uploaded and notified to Manufacturers</h1>
				<h1>Response</h1>
				<p>{response}</p>
			</div>
		{/if}
	</div>

	<div
		class="my-4 bg-emerald-500 bg-opacity-10 rounded-lg shadow-md p-8 max-h-full w-2/3 overflow-y-auto overflow-x-hidden"
	>
		<h1>Uploaded Updates</h1>
		<div class="my-4 grid grid-cols-8 w-full text-center">
			<h1>Name</h1>
			<h1>Description</h1>
			<h1>Device ID</h1>
			<h1>Version</h1>
			<h1>CID</h1>
			<h1>URL</h1>
			<h1>Manu_ID</h1>
		</div>
		<div class="my-4 w-full  overflow-x-hidden overflow-y-auto">
			{#each updateListJson as update}
				<div
					class=" bg-emerald-500 bg-opacity-10 rounded-lg shadow-md p-8 mb-8 grid grid-cols-8 w-full text-center my-1 gap-x-2"
				>
					<div class="overflow-x-auto flex flex-wrap max-h-32">{update.name}</div>
					<div class="overflow-x-auto flex flex-wrap max-h-32">
						{update.fileDescription}
					</div>
					<div class="overflow-x-auto flex flex-wrap max-h-32">{update.deviceID}</div>
					<div class="overflow-x-auto flex flex-wrap max-h-32">{update.version}</div>
					<div class="overflow-x-auto flex flex-wrap max-h-32">{update.cid}</div>
					<div class="overflow-x-auto flex flex-wrap max-h-32">
						<a
							href={update.url}
							target="_blank"
							rel="noreferrer"
							class="text-emerald-300 hover:text-emerald-500"
						>
							{update.url}
						</a>
					</div>
					<div class="overflow-x-auto flex flex-wrap max-h-16">
						<input
							type="text"
							bind:value={manuID}
							class=" w-full bg-black bg-opacity-30 border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md p-4 placeholder:italic"
						/>
					</div>
					<button
						class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-ellipsis"
						on:click={() =>
							pushUpdate(
								manuID,
								update.name,
								update.deviceID,
								update.version,
								update.cid,
								update.url,
							)}
					>
						Push Update To {manuID}
					</button>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* if disabled, gray out text */
	:disabled {
		color: #9ca3af;
	}
</style>
