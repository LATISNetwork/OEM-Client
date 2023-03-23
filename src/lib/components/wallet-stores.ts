

import type { PrivateKey, AccountId, PublicKey } from '@hashgraph/sdk';
import type { BigNumber } from 'bignumber.js';

import type { Wallet } from './ledgerabstract';
import type { AccountBalance, MirrorAccountInfo, SimpleHederaClient } from './hedera';

declare const __TEST__: boolean;
interface State {
	network: 'mainnet' | 'testnet' | 'previewnet';
	// the wallet that has been unlocked
	wallet: Wallet | null;
	// the specific instantiation of a client
	// from the unlocked wallet that is being used
	client: SimpleHederaClient | null;
	// the balance of the account associated with the client
	balance: AccountBalance | null;
	// the current price of HBARS in USD
	hbarPriceUsd: BigNumber.Instance | null;
	// a place to stuff extra information needed to process a transaction
	extraTxInfo: Record<string, string | number> | null;
	// is there an open prompt for the user on their hardware wallet
	prompt: boolean;
	// are you sure you want to logout? open state
	logoutConfirm: boolean;
	//Hedera network status
	networkStatus: boolean;
}

// @ledgerhq/hw-transport's TransportStatusError's doesn't expose status* properties
interface TransportStatusError extends Error {
    statusCode: number;
    statusText: string;
}

export class WalletStores implements State {
	network: 'mainnet' | 'testnet' | 'previewnet' = 'mainnet';
	wallet: Wallet | null = null;
	client: SimpleHederaClient | null = null;
	balance: AccountBalance | null = null;
	hbarPriceUsd: BigNumber.Instance | null = null;
	extraTxInfo: Record<string, string | number> | null = null;
	prompt: boolean = false;
	logoutConfirm: boolean = false;
	networkStatus: boolean = true;

	publicKey(): PublicKey | null {
		return this.client?.getPublicKey() ?? null;
	}

	privateKey(): PrivateKey | null {
		return this.client?.getPrivateKey() ?? null;
	}

	accountId(): AccountId | null {
		return this.client?.getAccountId() ?? null;
	}

	getClient(): SimpleHederaClient | null {
		return this.client ?? null;
	}

	extraInfo(): Record<string, string | number> | null {
		return this.extraTxInfo;
	}

	async networkPing(): Promise<boolean> {
		const { AccountBalanceQuery, AccountId } = await import('@hashgraph/sdk');
		const accountId = AccountId.fromString('0.0.2');

		try {
			new AccountBalanceQuery().setNodeAccountIds([accountId]).setAccountId(accountId);
			this.networkStatus = true;
		} catch (error) {
			this.networkStatus = false;
		}

		return this.networkStatus;
	}

	setNetwork(name: 'mainnet' | 'testnet' | 'previewnet') {
		this.network = name;
	}

	setWallet(wallet: Wallet | null) {
		this.wallet = wallet;

		if (wallet == null) {
			this.setClient(null);
		}
	}

	setClient(client: SimpleHederaClient | null) {
		this.balance = null;
		this.client = client;

		if (this.wallet?.hasPrivateKey()) {
			void this.requestAccountBalance();
		}
	}

	async requestAccountBalance() {
		if (this.client == null) return;

		this.balance = await this.client.getAccountBalance();
	}

	setExtraInfo(info: Record<string, string | number>): void {
		this.extraTxInfo = info;
	}

	setPromptOpen(open: boolean): void {
		this.prompt = open;
	}

	setConfirmLogoutOpen(open: boolean): void {
		this.logoutConfirm = open;
	}

	async errorMessage(error: Error): Promise<string> {
		const { Status, StatusError } = await import('@hashgraph/sdk');
		const { StatusCodes, TransportStatusError } = await import('@ledgerhq/hw-transport');

		if (error instanceof StatusError) {
			switch (error.status) {
				case Status.AccountDeleted:
				case Status.AccountExpiredAndPendingRemoval:
				case Status.AccountIdDoesNotExist:
				case Status.AccountKycNotGrantedForToken:
				case Status.AccountFrozenForToken:
				case Status.AccountRepeatedInAccountAmounts:
				case Status.Busy:
				case Status.Unknown:
				case Status.Unauthorized:
				case Status.DuplicateTransaction:
				case Status.EmptyTokenTransferAccountAmounts:
				case Status.EmptyTokenTransferBody:
				case Status.EmptyTransactionBody:
				case Status.FileContentEmpty:
				case Status.FileDeleted:
				case Status.MaxFileSizeExceeded:
				case Status.MemoTooLong:
				case Status.MessageSizeTooLarge:
				case Status.Ok:
				case Status.Success:
				case Status.PayerAccountNotFound:
				case Status.PayerAccountUnauthorized:
				case Status.ReceiptNotFound:
				case Status.RecordNotFound:
				case Status.ResultSizeLimitExceeded:
				case Status.TokenAlreadyAssociatedToAccount:
				case Status.TokenNotAssociatedToAccount:
				case Status.TokenNotAssociatedToFeeCollector:
				case Status.TokenHasNoWipeKey:
				case Status.TokenHasNoFeeScheduleKey:
				case Status.TokenHasNoFreezeKey:
				case Status.TokenHasNoKycKey:
				case Status.TokenHasNoSupplyKey:
				case Status.TokenWasDeleted:
				case Status.TokensPerAccountLimitExceeded:
			}
		} else if (error instanceof TransportStatusError) {
			// need to type assert because @ledgerhq/hw-transport's TransportStatusError doesn't expose statusCode property(?)
			switch ((error as TransportStatusError).statusCode) {
				case StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED:
				default:
			}
		}

		return error.message;
	}

	save() {
		return this;
	}
}
