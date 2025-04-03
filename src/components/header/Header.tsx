"use client"
import { FC, useContext, useEffect, useState } from "react";
import { ConnectButton } from "../buttons/ConnectButton";
import { useRouter } from "next/navigation";
import { PROGRAM_ID_IDL } from "@/program/programId";
import { AgentsLandListener } from "@/program/logListeners/AgentsLandListener";
import { connection } from "@/program/web3";
import { SwapInfo } from "@/utils/types";
import Link from "next/link";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Logo from "@/../public/assets/logo-light.png"
import AdminSocialList from "../others/AdminSocialList";
import UserContext from "@/context/UserContext";
import { useSocket } from "@/contexts/SocketContext";

interface coinInfo {
  creator: string;
  name: string;
  url: string;
  ticker: string;
  reserveOne: number;
  reserveTwo: number;
  token: string;
  commit: string;
  progressMcap?: number;
  lamportReserves?: number;
  tokenReservests: any[];
}

const Header: FC = () => {
  const { updateCoin, setUpdateCoin } = useContext(UserContext);
  const { newToken } = useSocket();
  const router = useRouter()
  const handleToRouter = (id: string) => {
    router.push(id)
  }
  const [latestCreatedToken, setLatestCreatedToken] = useState<coinInfo | null>(null);
  const [latestSwapInfo, setLatestSwapInfo] = useState<SwapInfo>(undefined);


  useEffect(() => {
    if (newToken) {
      if (newToken && typeof newToken === 'object') {
        console.log("newToken ===>", newToken)
        setLatestCreatedToken(newToken as unknown as coinInfo);
        setTimeout(() => {
          setLatestCreatedToken(null);
        }, 5000);
      }
    }
  }, [newToken]);

  useEffect(() => {
    const listener = new AgentsLandListener(connection);

    listener.setProgramLogsCallback('Launch', (basicTokenInfo: any) => {
      const newCoinInfo: coinInfo = {
        creator: basicTokenInfo.creator,
        name: basicTokenInfo.metadata.name,
        url: basicTokenInfo.metadata.json.image ?? basicTokenInfo.metadata.uri,
        ticker: basicTokenInfo.metadata.symbol,
        reserveOne: 0,
        reserveTwo: 0,
        token: basicTokenInfo.mintAddress,
        commit: '',
        progressMcap: 0,
        lamportReserves: 0,
        tokenReservests: [],

      };
      console.log("new coin info: ", newCoinInfo)
      setLatestCreatedToken(newCoinInfo);

      setTimeout(() => {
        setLatestCreatedToken(undefined);
      }, 5000);
    });

    listener.setProgramLogsCallback('Swap', (swapInfo: SwapInfo) => {

      console.log(swapInfo)
      setLatestSwapInfo(swapInfo);
      setUpdateCoin(!updateCoin)

      setTimeout(() => {
        setLatestSwapInfo(undefined);
      }, 5000);
    })

    const subId = listener.subscribeProgramLogs(PROGRAM_ID_IDL.toBase58());

    return () => {
      connection.removeOnLogsListener(subId);
    }
  }, []);

  return (
    <div className="w-full h-[100px] flex flex-col justify-center items-center border-b-[1px] border-b-[#fdd52f] shadow-[#fdd52f] shadow-[0px_8px_8px_0px]">
      <div className="container">
        <div className="w-full h-full flex flex-row justify-between items-center px-5">
          <div className="flex flex-row items-center gap-8">
            <Image src={Logo} alt="Logo" width={64} height={64} onClick={() => handleToRouter('/')} className="w-16 h-16 flex flex-col justify-center items-center cursor-pointer" />
            {latestSwapInfo &&
              <div>
                <div className="flex flex-col border-[1px] border-[#fdd52f] font-medium rounded-md px-4 py-2 gap-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#fdd52f] text-[12px]">
                      <strong className={`${latestSwapInfo.direction === "Sold" ? "text-green-600" : "text-red-600"}`}>{`${latestSwapInfo.direction === "Sold" ? "Buy" : "Sell"}`}</strong>: {new PublicKey(latestSwapInfo.creator).toBase58().slice(0, 9)}...
                      {new PublicKey(latestSwapInfo.creator).toBase58().slice(-9)}
                    </span>
                    <div className="w-full flex flex-row items-center gap-2">
                      <Image src={latestSwapInfo.mintUri} alt="latestSwapInfo" width={30} height={30} style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }} />
                      <span className="text-[#fdd52f] text-[12px]">{`${(latestSwapInfo.solAmountInLamports / LAMPORTS_PER_SOL)} SOL of ${latestSwapInfo.mintSymbol}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            }
            {latestCreatedToken &&
              <div>
                <div className="flex flex-col border-[1px] border-[#fdd52f] font-medium rounded-md px-4 py-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[#fdd52f] text-[12px]">
                      <strong className="font-bold text-[13px] text-green-600">New: </strong>
                      {latestCreatedToken.name}
                    </span>
                    <div className="w-full flex flex-row items-center gap-2">
                      <Image src={latestCreatedToken?.url} alt="latestCreatedToken" width={30} height={30} style={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '50%' }} />
                      <span className="text-[#fdd52f] text-[12px]">{`${new Date().toDateString()}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <div className="flex flex-row gap-4 items-center">
            <AdminSocialList />
            <ConnectButton></ConnectButton>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
