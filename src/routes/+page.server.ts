import { verifyAuth } from '$lib/auth/util';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DEV } from '$lib/server/config';
import { walletstores } from '$lib/components/wallet-stores';
import {componentType, loggedIn} from '$lib/stores/stores';
export const load = (async ({ fetch }) => {
	componentType.set(0);
	loggedIn.set(false);
	walletstores.subscribe((wallets) => {
		console.log('wallets.wallet', wallets);
		if (wallets.wallet !== null) {
			loggedIn.set(true);
			componentType.set(1);
		}
	});
	const params = await verifyAuth(fetch);
	if (params.loggedIn) {
		loggedIn.set(true);
		componentType.set(2);
	}
}) satisfies PageServerLoad;
