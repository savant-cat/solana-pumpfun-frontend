import { errorAlert, successAlert, warningAlert } from "../others/ToastGroup";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import UserContext from "@/context/UserContext";
import { getTokenBalance, swapTx } from "@/program/web3";
import { coinInfo } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useSocket } from "@/contexts/SocketContext";
import Spinner from "../loadings/Spinner";
import { FaRegCopy } from "react-icons/fa";
import { rayBuyTx, raySellTx } from "@/utils/raydiumSwap";
import { publicKey } from "@raydium-io/raydium-sdk";
import { BACKEND_URL } from "@/utils/util";
import axios from "axios";
// import { getBondingCurve } from "@/utils/util";

interface TradingFormProps {
  coin: coinInfo;
  progress: Number;
}

export const TradeForm: React.FC<TradingFormProps> = ({ coin, progress }) => {
  const { isLoading, setIsLoading, socket, counter } = useSocket();
  const [sol, setSol] = useState<string>('');
  const [isBuy, setIsBuy] = useState<number>(0);
  const [tokenBal, setTokenBal] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<string>(null);
  const { user } = useContext(UserContext);
  const wallet = useWallet();
  const SolList = [
    { id: "", price: "reset" },
    { id: "1", price: "1 sol" },
    { id: "5", price: "5 sol" },
    { id: "10", price: "10 sol" },
  ]


  const copyToClipBoard = async (copyMe: string) => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess('Copied!');
      successAlert("Copied!")
    }
    catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("value--->", value)
    if (!isNaN(parseFloat(value))) {
      setSol(value);
    } else if (value === '') {
      setSol(''); // Allow empty string to clear the input
    }
  };

  const getBalance = async () => {
    try {
      const balance = await getTokenBalance(user.wallet, coin.token);
      setTokenBal(balance ? balance : 0);
    } catch (error) {
      setTokenBal(0);
    }
  }

  const handlTrade = async () => {
    if (user.wallet === undefined || user.wallet === null || user.wallet === "") {
      warningAlert("Connect your wallet!")
      return
    } else {
      setIsLoading(true)
      try {
        const mint = new PublicKey(coin.token)
        const userWallet = new PublicKey(user.wallet)
        // const coinInfo = await getBondingCurve(coin.token)
        // const bondingPk = new PublicKey(coinInfo.bondingPk)
        // console.log("coin data ==>", bondingPk)

        if (coin.bondingCurve === false) {
          const data = await swapTx(mint, wallet, sol, isBuy)
          console.log("res ===> ", data.signature)

          const response = await axios.post(`${BACKEND_URL}/cointrade/update`, { token: mint.toBase58(), userId: user._id, tx: data.signature });
          console.log("response ===> ", response)
        } else {
          // if (isBuy === 0) {
          //   const res = await rayBuyTx(
          //     this.connection, mint, wallet, sol,
          //   )
          // } else if (isBuy === 1) {
          //   const res = await raySellTx(mint, wallet, sol, isBuy)
          // }
        }
        setSol('0');
        setIsLoading(false)
      } catch (err) {
        console.log(err)
        errorAlert(err?.message)
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    getBalance();
    console.log("socket coin  ==>", coin)

  }, [coin])

  useEffect(() => {
    console.log("socket  ==>", counter)
  }, [counter])

  return (
    <>
      {coin.bondingCurve === false ?
        <div className="p-3 rounded-lg bg-transparent border-[1px] border-[#fdd52f] text-white font-semibold gap-3 flex flex-col">
          <div className="flex flex-row justify-center px-3 py-2">
            < button className={`rounded-l-lg py-3 w-full border-[1px] border-[#fdd52f] ${isBuy === 0 ? 'bg-[#fdd52f]/30 text-white' : 'bg-transparent hover:bg-[#fdd52f]/5'}`
            } onClick={() => setIsBuy(0)}> Buy</button >
            <button className={`rounded-r-lg py-3 w-full border-[1px] border-[#fdd52f] ${isBuy === 1 ? 'bg-[#fdd52f]/30 text-white' : 'bg-transparent hover:bg-[#fdd52f]/5'}`} onClick={() => setIsBuy(1)}>
              Sell
            </button>
          </div >
          <div className="xs:px-4 flex flex-col relative gap-3">
            <div
              onClick={() => console.log("set max")}
              className="rounded bg-transparent text-center w-[200px] p-2 block mb-2 text-ml font-medium text-[#fdd52f] mx-auto border-[1px] border-[#fdd52f] hover:bg-[#fdd52f]/5 cursor-pointer"
            >
              Set max slippage
            </div>
            <div className="w-full flex flex-row items-center bg-transparent rounded-lg border-[1px] border-[#fdd52f]">
              <input
                type="number"
                id="setTrade"
                value={sol}
                onChange={handleInputChange}
                pattern="\d*"
                className="w-full outline-none text-[#fdd52f] p-2.5 capitalize rounded-l-md bg-transparent"
                placeholder="0.0"
                required
                min={0.001}
                max={95}
              />
              <div className="flex flex-col text-center p-2.5 bg-[#fdd52f]/10 text-[#fdd52f] border-l-[1px] border-l-[#fdd52f] rounded-r-md">
                {isBuy === 0 ? 'SOL' : 'Token'}
              </div>
            </div>
            {
              isBuy === 0 ? (
                <div className="flex flex-col xs:flex-row py-2 gap-3 text-center mx-auto xs:mx-0">
                  {SolList.map((item: any, index: any) => {
                    return (
                      <div key={index} className="max-w-[100px] rounded-lg px-2 py-1 border-[1px] border-[#fdd52f] text-[#fdd52f] hover:bg-[#fdd52f]/30 cursor-pointer" onClick={() => setSol(item.id)}>{item.price}</div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col xs:flex-row py-2 gap-3 text-center mx-auto xs:mx-0">
                  <button className="max-w-[100px] rounded-lg px-2 py-1 border-[1px] border-[#fdd52f] text-[#fdd52f] hover:bg-[#fdd52f]/30 cursor-pointer" onClick={() => setSol('')}>reset</button>
                  <button disabled={tokenBal && tokenBal !== 0 ? false : true} className={`${tokenBal && tokenBal !== 0 ? "cursor-pointer hover:bg-[#fdd52f]/30" : "cursor-not-allowed"} max-w-[100px] rounded-lg px-2 py-1 border-[1px] border-[#fdd52f] text-[#fdd52f] `} onClick={() => setSol((tokenBal / 10).toString())}>10%</button>
                  <button disabled={tokenBal && tokenBal !== 0 ? false : true} className={`${tokenBal && tokenBal !== 0 ? "cursor-pointer hover:bg-[#fdd52f]/30" : "cursor-not-allowed"} max-w-[100px] rounded-lg px-2 py-1 border-[1px] border-[#fdd52f] text-[#fdd52f]`} onClick={() => setSol((tokenBal / 4).toString())}>25%</button>
                  <button disabled={tokenBal && tokenBal !== 0 ? false : true} className={`${tokenBal && tokenBal !== 0 ? "cursor-pointer hover:bg-[#fdd52f]/30" : "cursor-not-allowed"} max-w-[100px] rounded-lg px-2 py-1 border-[1px] border-[#fdd52f] text-[#fdd52f]`} onClick={() => setSol((tokenBal / 2).toString())}>50%</button>
                  <button disabled={tokenBal && tokenBal !== 0 ? false : true} className={`${tokenBal && tokenBal !== 0 ? "cursor-pointer hover:bg-[#fdd52f]/30" : "cursor-not-allowed"} max-w-[100px] rounded-lg px-2 py-1 border-[1px] border-[#fdd52f] text-[#fdd52f]`} onClick={() => setSol((tokenBal).toString())}>100%</button>
                </div>
              )}

            {
              progress === 100 ? (
                <div className="text-white bg-[#fdd52f]/80  cursor-not-allowed w-full text-center rounded-full hover:bg-[#fdd52f]/60 py-2">
                  Place Trade
                </div>
              ) : (
                <div className="text-white bg-[#fdd52f]/80  cursor-pointer hover:bg-[#fdd52f]/60 w-full text-center rounded-full py-2" onClick={handlTrade}>
                  Place Trade
                </div>
              )}
          </div>
          {isLoading && <Spinner />}
        </div >
        :
        <div className="flex flex-col px-3 py-5 rounded-lg bg-transparent border-[1px] border-[#fdd52f] text-[#fdd52f] font-semibold gap-3">
          <div className="flex flex-col text-center text-xl">
            Currently this token has already been moved to raydium
          </div>
          <div className="text-[#fdd52f] font-semibold flex flex-row gap-2 items-center justify-center cursor-pointer">
            <FaRegCopy className="text-2xl" />
            <span className="text-sm">
              {coin?.token?.slice(0, 9)} .... {coin?.token?.slice(-9)}
            </span>
          </div>
        </div>
      }
    </>

  );
};
