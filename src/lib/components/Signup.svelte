<script>
	import { onMount } from 'svelte';
	import { componentType, loggedIn, ComponentType } from '$lib/stores/stores';
	import Icon from '@iconify/svelte';
	let username = '';
	let password = '';
	let password2 = '';
	let error = '';
	let email = '';
	let oemID = '';
	let signUpLoading = false;
	const signup = async () => {
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
			const addOEM = await fetch('/api/add-oem', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					oemID,
				}),
			});
			if (!addOEM.ok) {
				error = addOEM.statusText;
				console.log(addOEM);
			} else {
				const addOEMJson = await addOEM.json();
				console.log(addOEMJson);
				componentType.set(ComponentType.PORTAL);
				loggedIn.set(true);
			}
		}
	};

	onMount(() => {});
</script>

<h2 class="text-4xl font-bold mb-4 text-center">Sign Up</h2>
<form>
	<div class="mb-4">
		<label class="block  font-bold mb-2" for="email">Email</label>
		<input
			class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black bg-opacity-30 border-emerald-500"
			id="email"
			type="email"
			placeholder="Enter your email"
			bind:value={email}
		/>
	</div>
	<div class="mb-4">
		<label class="block  font-bold mb-2" for="email">OEM ID</label>
		<input
			class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black bg-opacity-30 border-emerald-500"
			type="text"
			placeholder="Ex. 0.0.2341234"
			bind:value={oemID}
		/>
	</div>

	<div class="mb-4">
		<label class="block  font-bold mb-2" for="password">Password</label>
		<input
			class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black bg-opacity-30 border-emerald-500"
			id="password"
			type="password"
			placeholder="Enter your password"
			bind:value={password}
		/>
	</div>

	<div class="mb-4">
		<label class="block  font-bold mb-2" for="password">Confirm Password</label>
		<input
			class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black bg-opacity-30 border-emerald-500"
			id="password2"
			type="password"
			placeholder="Enter your password"
			bind:value={password2}
		/>
	</div>
	<button
		class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
		type="submit"
		on:click={signup}
	>
		Sign Up
	</button>
</form>

{#if signUpLoading}
	<div class=" text-white p-2 rounded-lg mt-4">Signing up...</div>
{/if}
{#if error}
	<div class="bg-red-500 text-white p-2 rounded-lg mt-4">
		{error}
	</div>
{/if}
