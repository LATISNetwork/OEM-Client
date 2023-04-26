<script>
	import { onMount } from 'svelte';
	import { componentType, loggedIn, ComponentType } from '$lib/stores/stores';
	import Icon from '@iconify/svelte';
	let username = '';
	let password = '';
	let password2 = '';
	let error = '';
	let email = '';
	let signUpLoading = false;
	const signup = async () => {
		if (username.length < 3) {
			error = 'Username must be at least 3 characters long';
			return;
		}
		if (!email.includes('@') || !email.includes('.')) {
			error = 'Please enter a valid email address';
			return;
		}
		if (password.length < 6) {
			error = 'Password must be at least 6 characters long';
			return;
		}
		if (password !== password2) {
			error = 'Passwords do not match';
			return;
		}

		const signUp_res = await fetch('/api/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'same-origin',
			body: JSON.stringify({
				username,
				password,
				email,
			}),
		});
		signUpLoading = true;
		if (!signUp_res.ok) {
			// error = signUp_res.statusText;
			// console.log(signUp_res);
		} else {
			signUpLoading = false;
			componentType.set(ComponentType.PORTAL);
			loggedIn.set(true);
		}
	};

	onMount(() => {});
</script>

<div />
