<script>
	import Signup from '$lib/components/Signup.svelte';
	import { componentType, loggedIn, ComponentType } from '$lib/stores/stores';
	import Icon from '@iconify/svelte';
	let email = '';
	let password = '';
	let error = '';
	let loggingIn = false;
	const login = async () => {
		if (!email.includes('@') || !email.includes('.')) return (error = 'Invalid email');
		if (password.length < 6) return (error = 'Password must be at least 6 characters long');
		error = '';
		loggingIn = true;
		const signIn_res = await fetch(`/api/auth`, {
			method: 'POST',
			headers: new Headers({ 'Content-Type': 'application/json' }),
			credentials: 'same-origin',
			body: JSON.stringify({ email, password }),
		});

		if (!signIn_res.ok) return (error = 'User does not exist or incorrect password');
		loggingIn = false;
		componentType.set(ComponentType.PORTAL);
		loggedIn.set(true);
	};
</script>

<div />
