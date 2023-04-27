import { writable } from 'svelte/store';
import { walletstores } from '$lib/components/wallet-stores';
import { AccountId, ContractId, PrivateKey } from '@hashgraph/sdk';

export const walletstore = walletstores;

// Manufacturer Testnet Account
export const oemAccountId = AccountId.fromString("0.0.3713296"); //replace with actual account id
export const oemPrivateKey = PrivateKey.fromString
("3030020100300706052b8104000a042204207c28c85e3f5a24381e086b3c01d6abb42fd9c8d10fc461f5fcb4db9508dabbc4");
export const oemPublicKey = oemPrivateKey.publicKey.toEvmAddress();

export const manufacturerContract = ContractId.fromString("0.0.4408608"); // LatisManufacturer

export const oemContract = ContractId.fromString("0.0.4408618"); // LatisOEM