"use client"
import { FC, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UserContext from "@/context/UserContext";
import { FaXTwitter } from "react-icons/fa6";
import { TbWorld } from "react-icons/tb";
import { FaTelegramPlane } from "react-icons/fa";
import { MdLibraryAdd } from "react-icons/md";
import { coinInfo } from "@/utils/types";
import KingImg from "@/../public/assets/images/logo.png"
import Logo from "@/../public/assets/images/logo.png"


const TopToken: FC<{ data: coinInfo[] }> = ({ data }) => {
  const { setIsLoading, solPrice } = useContext(UserContext);
  const [daysAgo, setDaysAgo] = useState<string>("0d ago");
  const [topTokenData, setTopTokenData] = useState<coinInfo>({} as coinInfo);
  const router = useRouter();

  const limiteSolAmount: string | undefined = process.env.NEXT_PUBLIC_LIMITE_SOLAMOUNT;

  const handleToRouter = (id: string) => {
    setIsLoading(true)
    router.push(id)
  }

  const getDaysAgo = (coinDate: Date) => {
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

  const getTopToken = (data: coinInfo[]) => {
    let sortedData = [...data]; // Create a new array to prevent direct state mutation

    sortedData.sort((a, b) => b.progressMcap - a.progressMcap);

    console.log("sortedData ==> ", sortedData[0])
    setTopTokenData(sortedData[0])
    getDaysAgo(sortedData[0].date)
  }

  useEffect(() => {
    console.log("data ==> ", data)
    if (Array.isArray(data) && data.length > 0) {
      getTopToken(data)
    }
  }, [data])

  return (
    <div className="w-full h-full px-2">
      <div className="w-full justify-between flex flex-col items-start gap-6">
        <div className="w-full h-full flex flex-row justify-between items-center text-[#fdd52f] px-4">
          <div className="flex flex-row items-center text-3xl font-extrabold text-[#fdd52f] gap-3">
            Pump It!
          </div>
          <div onClick={() => handleToRouter('/create-coin')} className="flex flex-row gap-1 items-center px-12 py-2.5 border-[1px] border-[#fdd52f] hover:bg-[#fdd52f]/30 rounded-full cursor-pointer mx-auto xs:mx-0">
            <MdLibraryAdd className="text-2xl" />
            Create a Token
          </div>
        </div>
        <div
          onClick={() => handleToRouter(`/trading/${topTokenData._id}`)}
          className="w-full max-w-[720px] flex flex-col xs:flex-row gap-2 items-start justify-center mx-auto border-[#fdd52f] border-[1px] rounded-xl shadow-[0px_8px_8px_0px] shadow-[#fdd52f]/50 object-cover overflow-hidden pr-2 cursor-pointer"
        // style={{ backgroundImage: "url(/assets/images/toptokenbg.png)", backgroundSize: "22%", backgroundPosition: "right bottom", backgroundRepeat: "no-repeat" }}
        >
          <div className="w-full max-w-[300px] h-[160px] xs:h-[300px] flex flex-col justify-center items-center ">
            <Image
              src={topTokenData?.url ? topTokenData.url : KingImg}
              alt="TestTokenImg"
              width={300} // Set a width
              height={300} // Set a height
              className="flex flex-col w-[160px] max-h-[160px] xs:w-[300px] xs:max-h-[300px] object-cover overflow-hidden rounded-lg" />
          </div>
          <div className="w-full max-w-[420px] flex flex-col gap-2 justify-between items-start text-[#fdd52f] py-2 px-1 object-cover overflow-hidden">
            <p className="text-2xl font-bold">Name : {topTokenData.name ? topTokenData.name : "CatLove"}</p>
            <div className="text-xl font-semibold h-24">Description : <br /> <p className="flex flex-col w-full h-16 px-2 text-base object-cover overflow-hidden break-words text-[#b2af93]">{topTokenData.description ? topTokenData.description : "CatLove Pump"}</p></div>
            <div className="text-xl font-semibold">Contract : <p className="px-2 text-base flex w-full max-w-[400px] text-[#b2af93]">{topTokenData.token ? topTokenData.token : "token contract address"}</p></div>
            <div className="w-full flex flex-row gap-1 justify-end items-center text-white text-xl h-6">
              {(topTokenData?.twitter && topTokenData?.twitter !== undefined) && <FaXTwitter />}
              {(topTokenData?.telegram && topTokenData?.telegram !== undefined) && <FaTelegramPlane />}
              {(topTokenData?.website && topTokenData?.website !== undefined) && <TbWorld />}
            </div>
            <div className="w-full flex flex-col gap-1">
              <div className="w-full flex flex-row items-center justify-between">
                <div className="flex flex-row gap-1 items-center text-lg font-semibold">
                  MCAP :
                  <div className="text-[#b2af93] font-bold">
                    {(topTokenData?.progressMcap !== null || topTokenData?.progressMcap !== undefined)
                      ? topTokenData.progressMcap > 1000
                        ? '$' + (Math.ceil(topTokenData.progressMcap) / 1000 * solPrice).toFixed(2) + 'k'
                        : '$' + (topTokenData?.progressMcap * solPrice).toFixed(2)
                      : 'N/A'}
                  </div>
                </div>
                <div className="text-[#b2af93] font-bold">
                  {daysAgo}
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#ff1cff] relative flex object-cover overflow-hidden">
                <div
                  className="justify-start h-2 absolute top-0 left-0 bg-[#fdd52f]"
                  style={{ width: `${topTokenData?.progressMcap / Number(limiteSolAmount) * 100}%` }}  // Fix: Corrected percentage calculation
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopToken;
