import { coinInfo, userInfo } from "@/utils/types";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserContext from "@/context/UserContext";
import { TbWorld } from "react-icons/tb";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import NotImage from "@/../public/assets/images/no-image.png"

const limiteSolAmount: string | undefined = process.env.NEXT_PUBLIC_LIMITE_SOLAMOUNT;

interface CoinBlogProps {
  coin: coinInfo;
  componentKey: string;
}

export const CoinBlog: React.FC<CoinBlogProps> = ({ coin, componentKey }) => {
  const { solPrice } = useContext(UserContext);
  const [timeAgo, setTimeAgo] = useState<string>("0d ago");
  const [marketCapValue, setMarketCapValue] = useState<number>(0)
  const router = useRouter()

  const handleToProfile = (id: string) => {
    router.push(`/profile/${id}`)
  }

  const getMarketCapData = async (coin: coinInfo) => {
    const prog = coin.reserveTwo * 1000000 * solPrice / (coin.reserveOne * coin.marketcap);
    setMarketCapValue(prog > 1 ? 100 : Math.round(prog * 100000) / 1000);
  }

  const getTimeAgo = (coinDate: Date) => {
    const pastDate = new Date(coinDate); // Convert the ISO string to a Date object
    const currentDate = new Date(); // Get the current local date and time
    const differenceInMs = currentDate.getTime() - pastDate.getTime(); // Difference in milliseconds

    if (differenceInMs < 1000 * 60 * 60 * 24) {
      // Less than a day
      if (differenceInMs < 1000 * 60) {
        // Less than a minute
        setTimeAgo("Just now");
      } else {
        const _minutesAgo = Math.floor(differenceInMs / (1000 * 60));
        if (_minutesAgo < 60) {
          // Less than an hour
          setTimeAgo(`${_minutesAgo}m ago`);
        } else {
          // Less than an hour
          const minutesAgo = Math.floor(_minutesAgo / 60);
          setTimeAgo(`${minutesAgo}h ago`);
        }
      }
    } else {
      const daysAgo = Math.floor(differenceInMs / (1000 * 60 * 60 * 24)); // Convert ms to days
      setTimeAgo(`${daysAgo}d ago`);
    }
  };

  useEffect(() => {
    getMarketCapData(coin)
    getTimeAgo(coin.date)
  }, [coin])

  return (
    <div className="flex flex-col h-full items-center justify-between border-[#fdd52f] border-[1px] rounded-lg text-[#fdd52f] gap-2 object-cover overflow-hidden">
      <div className="flex flex-row w-full">
        <div className="relative w-36 h-36 rounded-tl-md overflow-hidden items-center justify-center flex flex-col px-1">
          <Image
            src={coin?.url ? coin.url : NotImage}
            alt="image"
            width={144}
            height={144}
            className="object-cover flex items-center rounded-lg"
          />
        </div>
        <div className="flex flex-col w-full px-2 gap-1 py-1">
          <div className="w-full text-base text-[#fdd52f] font-semibold">
            {coin?.name} [ {coin?.ticker} ]
          </div>
          <div className="flex flex-row gap-1 text-sm">
            <div className="flex flex-row gap-1 items-center">
              Created by :
            </div>
            <div onClick={() => handleToProfile((coin?.creator as userInfo)?._id)}>
              <div className="text-[#1f47ca] px-1">
                {(coin?.creator as userInfo)?.name}
              </div>
            </div>
          </div>
          <div className="text-xs h-[28px] object-cover overflow-hidden break-words">{coin?.description}</div>
          <div className="w-full h-4 flex flex-row gap-1 justify-end items-center text-[#fdd52f] text-base">
            {(coin?.twitter && coin?.twitter !== undefined) && <FaXTwitter />}
            {(coin?.telegram && coin?.telegram !== undefined) && <FaTelegramPlane />}
            {(coin?.website && coin?.website !== undefined) && <TbWorld />}
          </div>
          <div className="w-full flex flex-col text-xs gap-1">
            <div className="w-full flex flex-row items-center justify-between">
              <div className="flex flex-row gap-1 items-center">
                MCAP :
                <div className="text-[#1f47ca] font-bold">
                  {(coin?.progressMcap !== null || coin?.progressMcap !== undefined)
                    ? coin.progressMcap > 1000
                      ? '$' + (Math.ceil(coin.progressMcap) / 1000 * solPrice).toFixed(2) + 'k'
                      : '$' + (coin?.progressMcap * solPrice).toFixed(2)
                    : 'N/A'}
                </div>
              </div>
              <div className="text-[#1f47ca] font-bold">
                {timeAgo}
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#ff1cff] relative flex object-cover overflow-hidden">
              <div
                className="justify-start h-2 absolute top-0 left-0 bg-[#fdd52f]"
                style={{ width: `${coin?.progressMcap / Number(limiteSolAmount) * 100}%` }}  // Fix: Corrected percentage calculation
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
