import { writable } from 'svelte/store';
import { WalletStores } from '$lib/components/wallet-stores';

export const walletstore = writable(new WalletStores());