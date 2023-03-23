import { writable } from 'svelte/store';
import { WalletStores } from '$lib/components/wallet-stores';

const w = new WalletStores();

export const walletstore = writable(w.save());