<script lang="ts">
    /// <reference types="w3c-web-usb" />
	import { onMount } from 'svelte';
	import { walletstore } from '$lib/stores/wallet';
	import { LedgerHardwareWallet } from './hardware-ledger';

	let busy = false;
	let error = "";
	let disabled = false;

	const isWebUSBSupported = async () => {
		return Promise.resolve(
			!!navigator && !!navigator.usb && typeof navigator.usb.getDevices === 'function',
		);
	};


	const handleConnect = async () => {
		disabled = true;
		busy = true;
		error = "";
		try {
			const wallet = new LedgerHardwareWallet();

			$walletstore.setWallet(wallet);
			console.log('Connected to Ledger');
			console.log(wallet);
			
			wallet.getPublicKey(0).then((pubkey) => {
				console.log('pubkey', pubkey);
			});
			
		}
		catch (e : any) { // Bad practice <- Lazy Forrest
			error = e.message;
			console.log('Error connecting to Ledger');
			console.log(e);
		}
		finally {
			busy = false;
			disabled = false;
		}
	}

	onMount(() => {
		isWebUSBSupported().then((supported) => {
			if (supported) {
				console.log('WebUSB is supported');
				handleConnect();
			} else {
				disabled = true;
				error = "WebUSB is not supported";
				console.log('WebUSB is not supported');
			}
		});
	});
</script>
