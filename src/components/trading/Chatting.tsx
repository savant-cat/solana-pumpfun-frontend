import { coinInfo, holderInfo, tradeInfo } from "@/utils/types";
import { MessageForm } from "../MessageForm";
import { useContext, useEffect, useMemo, useState } from "react";
import { Trade } from "./Trade";
import { findHolders, getCoinTrade, getMessageByCoin } from "@/utils/util";
import UserContext from "@/context/UserContext";
import ReplyModal from "../modals/ReplyModal";
import { MdAccessTime } from "react-icons/md";
import { Holders } from "./Holder";
import { useSocket } from "@/contexts/SocketContext";
import { flare } from "viem/chains";

interface ChattingProps {
  param: string | null;
  coin: coinInfo
}

export const Chatting: React.FC<ChattingProps> = ({ param, coin }) => {
  const { messages, setMessages, newMsg, coinId, postReplyModal, setPostReplyModal, user } = useContext(UserContext);
  const { newTx } = useSocket();
  const [trades, setTrades] = useState<tradeInfo>({} as tradeInfo);
  const [tradesData, setTradesData] = useState<any[]>([]);

  const [currentTable, setCurrentTable] = useState<string>("thread");
  const [topHolders, setTopHolders] = useState<holderInfo[]>([])
  const tempNewMsg = useMemo(() => newMsg, [newMsg]);

  useEffect(() => {
    const fetchData = async () => {
      if (param) {
        if (currentTable === "thread") {
          const data = await getMessageByCoin(param);
          setMessages(data.reverse());
        } else if (currentTable === "trades") {
          const data = await getCoinTrade(coin.token);
          setTrades(data)
        }
        else if (currentTable === "top holders") {
          const data = await findHolders(coin.token);
          console.log("data ===> ", data);

          // Sort by amount (assuming each item has an "amount" property)
          const sortedData = data.sort((a, b) => b.amount - a.amount).slice(0, 10);

          setTopHolders(sortedData);
        }
      }
      console.log("messages ==>", messages)
    }
    fetchData();
  }, [currentTable, param, coinId])


  useEffect(() => {
    let _trades = [];
    _trades = trades.record?.reverse();
    console.log("_trades  ==>", _trades)
    setTradesData(_trades)
  }, [trades])

  useEffect(() => {
    if (coinId == coin._id) {
      setMessages([tempNewMsg, ...messages])
    }
  }, [tempNewMsg])

  useEffect(() => {
    if (newTx) {
      console.log("chatting newTx ===>", newTx);
      console.log("user  ===> ", user)
      setTradesData((prev) => (Array.isArray(prev) ? [newTx, ...prev] : [newTx])); // Ensure prev is an array
    }
  }, [newTx]);

  return (
    <div className="pt-8">
      <div className="flex flex-row items-center text-white font-semibold justify-between px-2">
        <div className="flex flex-row items-center">
          <div
            onClick={() => setCurrentTable("thread")}
            className={`border-b-[2px] px-4 py-1 text-base cursor-pointer ${currentTable === "thread" ? "border-b-[#fdd52f] text-[#fdd52f]" : "border-b-[#fdd52f]/30 text-[#fdd52f]/30"
              }`}
          >
            Thread
          </div>
          <div
            onClick={() => setCurrentTable("trades")}
            className={`border-b-[2px] px-4 py-1 text-base cursor-pointer ${currentTable === "trades" ? "border-b-[#fdd52f] text-[#fdd52f]" : "border-b-[#fdd52f]/30 text-[#fdd52f]/30"
              }`}
          >
            Trades
          </div>
          <div
            onClick={() => setCurrentTable("top holders")}
            className={`border-b-[2px] px-4 py-1 text-base cursor-pointer ${currentTable === "top holders" ? "border-b-[#fdd52f] text-[#fdd52f]" : "border-b-[#fdd52f]/30 text-[#fdd52f]/30"
              }`}
          >
            Top Holders
          </div>
        </div>
        <div onClick={() => setPostReplyModal(true)} className="w-[180px] flex flex-col justify-center text-center font-semibold border-[1px] border-[#fdd52f] hover:bg-[#fdd52f]/30 rounded-full px-5 py-1 text-lg cursor-pointer text-[#fdd52f]">Post Reply</div>
      </div>
      <div className="flex flex-col w-full max-h-[650px] min-h-[50px] object-cover overflow-hidden overflow-y-scroll p-3 mt-8 rounded-lg ">

        {currentTable === "thread" &&
          <div>
            {messages && messages.map((message, index) => (
              <MessageForm key={index} msg={message} ></MessageForm>
            ))}
          </div>
        }

        {currentTable === "trades" &&
          <div className="w-full max-w-[720px] border-[1px] border-[#fdd52f] mx-auto h-full rounded-lg object-cover overflow-hidden">
            <table className="w-full h-full">
              <thead className="w-full border-[1px] border-[#fdd52f] bg-[#1D1D1D] text-[#fdd52f]">
                <tr className="text-lg text-centers">
                  <th className="py-2 text-center text-[#fdd52f] border-r-[1px] border-r-[#fdd52f]">Account</th>
                  <th className="py-2 text-[#fdd52f] border-r-[1px] border-r-[#fdd52f]">Type</th>
                  <th className="py-2 text-[#fdd52f] border-r-[1px] border-r-[#fdd52f]">SOL</th>
                  <th className="py-2 text-[#fdd52f] border-r-[1px] border-r-[#fdd52f]">Token</th>
                  <th className="py-2 flex flex-row gap-1 justify-center items-center cursor-pointer text-[#fdd52f] border-r-[1px] border-r-[#fdd52f]">Date <MdAccessTime className="text-[#fdd52f]" /></th>
                  <th className="py-2 text-[#fdd52f]">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {tradesData && tradesData.map((trade, index) => (
                  <Trade key={index} trade={trade} lastData={((tradesData.length - 1) === index ? true : false)}></Trade>
                ))}
              </tbody>
            </table>
          </div>
        }

        {currentTable === "top holders" &&
          <div className="w-full max-w-[460px] mx-auto h-full border-[1px] border-[#fdd52f] rounded-lg object-cover overflow-hidden">
            <table className="w-full h-full">
              <thead className="w-full border-[1px] border-[#fdd52f] bg-[#1D1D1D] text-[#fdd52f]">
                <tr className="text-lg text-start">
                  <th className="py-2 text-[#fdd52f] border-r-[1px] border-r-[#fdd52f]">No</th>
                  <th className="py-2 text-[#fdd52f] border-r-[1px] border-r-[#fdd52f]">Holder</th>
                  <th className="py-2 text-[#fdd52f]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topHolders && topHolders.map((item, index) => (
                  <Holders key={index} holder={item} index={index} lastData={((topHolders.length - 1) === index ? true : false)}></Holders>
                ))}
              </tbody>
            </table>
          </div>
        }

      </div>
      {
        postReplyModal &&
        <ReplyModal data={coin} />
      }
    </div >
  );
};
