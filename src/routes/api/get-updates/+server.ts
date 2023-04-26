import type { RequestHandler } from './$types';
import { getUserData } from '../get-user-data/get-user';
import admin from '$lib/firebase-admin';

export const POST = (async ({fetch, request, cookies }) => {
	// const body = await request.json();
    const { uid } = await getUserData(fetch, cookies, admin);
    const userData = (await admin.firestore().collection('users').doc(uid).get()).data();
    const oemID = userData?.oemID;
    let res = await admin.firestore().collection(oemID).get();
    console.log(res.docs.map(doc => doc.data()));
    if (res instanceof Error) return new Response(res.message, { status: 500 });
    return new Response(JSON.stringify(res.docs.map(doc => doc.data())), { status: 200 });
}) satisfies RequestHandler;
