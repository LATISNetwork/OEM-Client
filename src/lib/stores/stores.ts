import { writable } from 'svelte/store';
export enum ComponentType {
	LEDGER,
	LOGIN,
	PORTAL,
}

export let componentType = writable(ComponentType.LEDGER);

export let loggedIn = writable(false);
