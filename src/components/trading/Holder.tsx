import { holderInfo } from "@/utils/types";
import React from "react";

interface TradePropsInfo {
  holder: holderInfo;
  index: number;
  lastData: boolean;
}

export const Holders: React.FC<TradePropsInfo> = ({ holder, index, lastData }) => {

  return (
    <tr className={`w-full text-white bg-[#0E0E0E] border-b-[1px] border-b-white/20 ${lastData ? "" : "border-b-[1px] border-b-white/20"}`} >
      <td className="text-center py-2 border-[1px] border-[#fdd52f]">{index + 1}</td>
      <td className="text-center py-2 border-[1px] border-[#fdd52f]">{holder.slice}</td>
      <td className="text-center py-2 border-[1px] border-[#fdd52f]">{(holder.amount / 10 ** 6)}</td>
    </tr>
  );
};
