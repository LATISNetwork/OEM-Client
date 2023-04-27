<script lang="ts">
	/// <reference types="w3c-web-usb" />
	import { onMount } from 'svelte';
	import { walletstores } from '$lib/components/wallet-stores';
	import { LedgerHardwareWallet } from './hardware-ledger';
	import { goto } from '$app/navigation';
	import { componentType, loggedIn, ComponentType, pubKey } from '$lib/stores/stores';
	// import * as usb from '../../usb.bundle.js';

	let busy = false;
	let error = '';
	let disabled = false;

	const isWebUSBSupported = async () => {
		return Promise.resolve(
			!!navigator && !!navigator.usb && typeof navigator.usb.getDevices === 'function',
		);
	};

	const handleConnect = async () => {
		disabled = true;
		busy = true;
		error = '';
		let devicesList = await navigator.usb.getDevices();
		console.log(devicesList);
		const devices = await navigator.usb
			.requestDevice({ filters: [] })
			.then((device) => {
				console.log(device.productName); // "Arduino Micro"
				console.log(device.manufacturerName); // "Arduino LLC"
			})
			.catch((error) => {
				console.log(error);
			});
		console.log('devices: ', devices);

		try {
			const wallet = await new LedgerHardwareWallet();

			const store = walletstores;
			await store.setWallet(wallet);
			console.log('Connected to Ledger');
			console.log(wallet);

			const pubKeyL = await wallet.getPublicKey(0).then(() => {
				console.log('connected to ledger!!!!');
				$componentType = ComponentType.LOGIN;
			});
			console.log('pubKey: ', pubKeyL);
		} catch (e: any) {
			// Bad practice <- Lazy Forrest
			error = e.message;
			console.log('Error connecting to Ledger');
			console.log(e);
		} finally {
			busy = false;
			disabled = false;
		}
	};

	onMount(() => {
		isWebUSBSupported().then((supported) => {
			if (supported) {
				console.log('WebUSB is supported');
				// handleConnect();
			} else {
				disabled = true;
				error = 'WebUSB is not supported';
				console.log('WebUSB is not supported');
			}
		});
	});
</script>

<div class="flex flex-col justify-center items-center h-screen gap-y-2 text-center">
	<h1 class="text-5xl text-emerald-200 font-bold">LATIS</h1>
	<h1 class="text-emerald-400 mb-4 text-lg">Secure your device updates, decentralized and trusted.</h1>
	<button
		on:click={handleConnect}
		class="border-2 border-solid border-white rounded-full py-2 px-8 text-white font-bold text-xl bg-black hover:animate-pulse bg-opacity-10"
	>
		Connect Your Hardware Wallet
	</button>
	<h1 class="text-gray-400 text-lg">powered by the Hedera Network</h1>
</div>
