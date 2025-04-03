"use client";
import { Chatting } from "@/components/trading/Chatting";
import { TradeForm } from "@/components/trading/TradeForm";
import { TradingChart } from "@/components/TVChart/TradingChart";
import UserContext from "@/context/UserContext";
import { coinInfo } from "@/utils/types";
import { getCoinInfo } from "@/utils/util";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import SocialList from "../others/socialList";
import TokenData from "../others/TokenData";
import { DataCard } from "../cards/DataCard";
import { FaCopy } from "react-icons/fa6";
import { successAlert } from "../others/ToastGroup";
import Spinner from "../loadings/Spinner";

export default function TradingPage() {
  const { coinId, setCoinId, isLoading, setIsLoading, updateCoin, setUpdateCoin } = useContext(UserContext);
  const pathname = usePathname();
  const [param, setParam] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [daysAgo, setDaysAgo] = useState<string>("0d ago")
  const [coin, setCoin] = useState<coinInfo>({} as coinInfo);
  const [copySuccess, setCopySuccess] = useState<string>(null);
  const router = useRouter()
  const limiteSolAmount: string | undefined = process.env.NEXT_PUBLIC_LIMITE_SOLAMOUNT;

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

  const getTimeAgo = (coinDate: Date) => {
    const pastDate = new Date(coinDate); // Convert the ISO string to a Date object
    const currentDate = new Date(); // Get the current local date and time
    const differenceInMs = currentDate.getTime() - pastDate.getTime(); // Difference in milliseconds

    if (differenceInMs < 1000 * 60 * 60 * 24) {
      // Less than a day
      if (differenceInMs < 1000 * 60) {
        // Less than a minute
        setDaysAgo("Just now");
      } else {
        const _minutesAgo = Math.floor(differenceInMs / (1000 * 60));
        if (_minutesAgo < 60) {
          // Less than an hour
          setDaysAgo(`${_minutesAgo}m ago`);
        } else {
          // Less than an hour
          const minutesAgo = Math.floor(_minutesAgo / 60);
          setDaysAgo(`${minutesAgo}h ago`);
        }
      }
    } else {
      const daysAgo = Math.floor(differenceInMs / (1000 * 60 * 60 * 24)); // Convert ms to days
      setDaysAgo(`${daysAgo}d ago`);
    }
  };

  // const getLiquidity = () => {

  // }

  // const getMkpCap = () => {

  // }

  const getData = (pathname: string) => {
    setIsLoading(true)
    try {
      const fetchData = async () => {
        // Split the pathname and extract the last segment
        const segments = pathname.split("/");
        const parameter = segments[segments.length - 1];
        setParam(parameter);
        setCoinId(parameter);
        console.log("parameter   ===>", parameter)
        const data = await getCoinInfo(parameter);
        console.log("data  --->", data)
        setCoin(data);
        setProgress(data.progressMcap)
        // getLiquidity(data.progressMcap)
        // getMkpCap(data.progressMcap)
        getTimeAgo(data.date)
        setIsLoading(false)
      }
      fetchData();
    } catch (error) {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getData(pathname)
  }, [pathname, updateCoin]);

  return (
    <div className="w-full flex flex-col px-3 mx-auto gap-5 pt-10 pb-20">
      <div className="text-center">
        <div className="w-full flex flex-col">
          <div onClick={() => router.push('/')} className="w-24 cursor-pointer text-[#fdd52f] text-2xl flex flex-row items-center gap-2 pb-2">
            <IoMdArrowRoundBack />
            Back
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col md3:flex-row gap-4">
        {/* trading view chart  */}
        <div className="w-full px-2">
          <div className="w-full flex flex-col justify-between text-[#fdd52f] gap-2">
            <div className="flex flex-row justify-between items-center gap-2 pb-2">
              <p className="font-semibold">Contract Address : </p>
              <p onClick={(e) => copyToClipBoard(coin?.token)} className="flex flex-row gap-1 items-center cursor-pointer hover:text-blue-500">
                {coin?.token}
                <FaCopy />
              </p>
            </div>
          </div>
          <TradingChart param={coin}></TradingChart>
          <Chatting param={param} coin={coin}></Chatting>
        </div>
        <div className="w-full max-w-[300px] 2xs:max-w-[420px] px-2 gap-4 flex flex-col mx-auto">
          <TradeForm coin={coin} progress={progress}></TradeForm>
          <TokenData coinData={coin} />
          <div className="flex flex-col gap-3 border-[1px] border-[#fdd52f] rounded-lg">
            <div className="w-full flex flex-col gap-2 px-3 py-2 ">
              <p className="text-white text-base lg:text-xl">
                Completion : {`${coin.bondingCurve === false ? (progress / Number(limiteSolAmount) * 100).toFixed(2) : "Done"}`}% of {daysAgo}
              </p>
              <div className="bg-[#ff1cff] rounded-full h-2 relative object-cover overflow-hidden">
                <div
                  className="bg-[#fdd52f] h-2"
                  style={{ width: `${coin.bondingCurve === false ? (progress / Number(limiteSolAmount) * 100) : "100"}%` }}  // Fix: Corrected percentage calculation
                ></div>
              </div>
            </div>
          </div>

          {/* <div className="w-full flex flex-col gap-4 text-[#f52a6d]">
            <div className="w-full flex flex-col 2xs:flex-row gap-4 items-center justify-between">
              <DataCard text="Liquidity" data={progress} />
              <DataCard text="MKP CAP" data={progress} />
            </div>
          </div> */}
          <SocialList data={coin} />
        </div>
      </div>
      {isLoading && <Spinner />}
    </div>
  );
}
