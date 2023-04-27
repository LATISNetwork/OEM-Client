import type { RequestHandler } from './$types';
import { getUserData } from '../get-user-data/get-user';
import admin from '$lib/firebase-admin';

export const POST = (async ({ fetch, request, cookies }) => {
	const body = await request.json();
	const { uid } = await getUserData(fetch, cookies, admin);
	console.log(body, uid);
	const userData = (await admin.firestore().collection('users').doc(uid).get()).data();
	const oemID = userData?.oemID;
	const manuID = body.manuID;
	console.log('manuId', manuID);
	let res = await admin.firestore().collection('manus').doc(manuID).get();
	if (res instanceof Error) {
		await admin
			.firestore()
			.collection('manus')
			.doc(manuID)
			.set({
				updates: [
					{
						new: true,
						version: body.version,
						oemID,
					},
				],
			});
		return new Response('Ok');
	}
	console.log('oemID', oemID);
	try {
		let data = res.data();
		await admin
			.firestore()
			.collection('manus')
			.doc(manuID)
			.set({
				...data,
				updates: [
					{
						new: true,
                        deviceID: body.d_id,
						version: body.version,
						oemID,
					},
				],
			});
	} catch (error) {
		if (error instanceof Error) {
			return new Response(error.message, { status: 500 });
		}
	}
	return new Response('Ok');
}) satisfies RequestHandler;
