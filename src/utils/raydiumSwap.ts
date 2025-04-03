import { getAssociatedTokenAddress, NATIVE_MINT } from "@solana/spl-token"
import { WalletContextState } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { getBuyTx, getSellTx } from "./swapOnlyAmm"

export const rayBuyTx = async (solanaConnection: Connection, baseMint: PublicKey, buyAmount: number, wallet: WalletContextState, poolId: PublicKey) => {
    let solBalance: number = 0
    solBalance = await solanaConnection.getBalance(wallet.publicKey)
    try {
        console.log(":rocket: ~ rayBuyTx ~ solBalance:", solBalance)
    } catch (error) {
        console.log("Error getting balance of wallet")
        return null
    }
    if (solBalance == 0) {
        return null
    }
    try {
        const tx = await getBuyTx(solanaConnection, wallet, baseMint, NATIVE_MINT, buyAmount, poolId.toBase58())
        try {
            return tx;
        } catch (error) {
            console.log(`Error getting buy transaction`)
            console.error(error);
            return null;
        }
    } catch (error) {
        return null
    }
}
export const raySellTx = async (solanaConnection: Connection, baseMint: PublicKey, amount: string, wallet: WalletContextState, poolId: PublicKey,) => {
    try {
        const tokenAta = await getAssociatedTokenAddress(baseMint, wallet.publicKey)
        const tokenBalInfo = await solanaConnection.getTokenAccountBalance(tokenAta)
        console.log(":rocket: ~ raySellTx ~ tokenBalInfo:", tokenBalInfo)
        if (!tokenBalInfo) {
            console.log("Balance incorrect")
        }
        if (parseFloat(amount) < parseFloat(tokenBalInfo.value.amount)) {
            console.log("Balance is not enough.")
            return null;
        }
        try {
            const sellTx = await getSellTx(solanaConnection, wallet, baseMint, NATIVE_MINT, amount, poolId.toBase58())
            if (sellTx == null) {
                console.log(`Error getting buy transaction`)
                return null
            }
            return sellTx;
        } catch (error) {
            return null
        }
    } catch (error) {
        return null
    }
}