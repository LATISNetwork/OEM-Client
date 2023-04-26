import type { RequestHandler } from './$types';
import admin from '$lib/firebase-admin';

export const POST = (async ({ request }) => {
	const body = await request.json();
	try {
		await admin.firestore().collection('updates').add(body);
	} catch (error) {
		if (error instanceof Error) {
			return new Response(error.message, { status: 500 });
		}
	}
	return new Response('Ok');
}) satisfies RequestHandler;
