import { ComputeBudgetProgram, Connection, Keypair, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { Pumpfun } from './pumpfun'
import idl from "./pumpfun.json"
import * as anchor from '@coral-xyz/anchor';
import { WalletContextState, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { errorAlert, successAlert } from '@/components/others/ToastGroup';
import { Program } from '@coral-xyz/anchor';
import { SEED_CONFIG } from './seed';
import { launchDataInfo } from '@/utils/types';

export const commitmentLevel = "processed";

export const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
// export const decimals = process.env.NEXT_PUBLIC_TEST_DECIMALS;
export const connection = new Connection(endpoint, commitmentLevel);
export const pumpProgramId = new PublicKey(idl.address);
export const pumpProgramInterface = JSON.parse(JSON.stringify(idl));


// Send Fee to the Fee destination
export const createToken = async (wallet: WalletContextState, coinData: launchDataInfo) => {

};

// Swap transaction
export const swapTx = async (mint: PublicKey, wallet: WalletContextState, amount: string, type: number): Promise<any> => {
  
};

export const getTokenBalance = async (walletAddress: string, tokenMintAddress: string) => {
  
};
