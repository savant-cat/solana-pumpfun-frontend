import { recordInfo } from "@/utils/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import UserImg from "@/../public/assets/images/user-avatar.png"

interface TradePropsInfo {
  trade: recordInfo;
  lastData: boolean;
}

export const Trade: React.FC<TradePropsInfo> = ({ trade, lastData }) => {
  const [timeAgo, setTimeAgo] = useState<string>("0d ago");
  const router = useRouter();

  const handleToRouter = (id: string) => {
    router.push(id);
  };

  const getTimeAgo = (coinDate: Date) => {
    const pastDate = new Date(coinDate); // Convert the ISO string to a Date object
    const currentDate = new Date(); // Get the current local date and time
    const differenceInMs = currentDate.getTime() - pastDate.getTime(); // Difference in milliseconds

    if (differenceInMs < 1000 * 60) {
      // Less than a minute
      setTimeAgo("Just now");
    } else if (differenceInMs < 1000 * 60 * 60) {
      // Less than an hour
      const minutesAgo = Math.floor(differenceInMs / (1000 * 60));
      setTimeAgo(`${minutesAgo}m ago`);
    } else if (differenceInMs < 1000 * 60 * 60 * 24) {
      // Less than a day
      const hoursAgo = Math.floor(differenceInMs / (1000 * 60 * 60));
      setTimeAgo(`${hoursAgo}h ago`);
    } else {
      // More than a day
      const daysAgo = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
      setTimeAgo(`${daysAgo}d ago`);
    }
  };

  useEffect(() => {
    getTimeAgo(trade?.time);
  }, [trade]);

  return (
    <tr className={`${trade.amountIn === 0 && "hidden"} w-full text-white rounded-b-xl bg-[#0E0E0E] ${lastData ? "" : "border-b-[1px] border-b-white/20"}`}>
      <td className="flex flex-row gap-2 items-center justify-start py-2 border-r-[1px] border-r-[#fdd52f] px-2">
        <Image
          src={(trade.holder?.avatar === null || trade.holder?.avatar === undefined || trade.holder?.avatar === "") ? trade?.holder?.avatar : UserImg}
          alt="Token IMG"
          className="rounded-full"
          width={36}
          height={36}
        />
        <div className="text-lg">{trade.holder?.name}</div>
      </td>
      <td className={`${trade.swapDirection === 0 ? "text-green-600" : "text-red-600"} text-center py-2 border-r-[1px] border-r-[#fdd52f]`}>{trade.swapDirection == 0 ? "Buy" : "Sell"}</td>
      <td className={`${trade.swapDirection === 0 ? "text-red-600" : "text-green-600"} text-center py-2 border-r-[1px] border-r-[#fdd52f]`}>{trade.swapDirection == 0 ? `-${(trade?.amountIn / 10 ** 9)}` : `+ ${(trade?.amountOut / 10 ** 9)}`}</td>
      <td className={`${trade.swapDirection === 0 ? "text-green-600" : "text-red-600"} text-center py-2 border-r-[1px] border-r-[#fdd52f]`}>{trade.swapDirection == 0 ? `+${(trade?.amountOut / 10 ** 6)}` : `-${(trade?.amountIn / 10 ** 6)}`}</td >
      <td className="text-center py-2 border-r-[1px] border-r-[#fdd52f]">{timeAgo}</td>
      <td className="text-center py-2">
        <p
          onClick={() => handleToRouter(`https://solscan.io/tx/${trade?.tx}?cluster=devnet`)}
          className="text-lg leading-10 hover:cursor-pointer hover:text-white"
        >
          {trade?.tx?.slice(0, 8)}
        </p>
      </td>
    </tr>
  );
};
