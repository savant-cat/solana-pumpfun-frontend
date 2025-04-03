"use client"
import { msgInfo, userInfo } from "@/utils/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import UserIcon from "@/../public/assets/images/user-avatar.png"

interface MessageFormProps {
  msg: msgInfo;
}

export const MessageForm: React.FC<MessageFormProps> = ({ msg }) => {
  const [postTime, setPostTime] = useState<string>("")


  const getTime = (e: any) => {
    const timestamp: any = e;
    const date = new Date(timestamp);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    setPostTime(formattedDate)
  }

  useEffect(() => {
    getTime(msg.time)
    console.log("msg data ===>", msg)
  }, [msg])

  return (
    <div className="py-2 flex flex-col">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row w-full items-center justify-between">
          <div className="flex flex-row gap-2 items-center px-1">
            <Image
              src={((msg.sender as userInfo)?.avatar === null || (msg.sender as userInfo)?.avatar === undefined || (msg.sender as userInfo)?.avatar === "https://scarlet-extra-cat-880.mypinata.cloud/") ? UserIcon : (msg.sender as userInfo)?.avatar}
              alt="Token IMG"
              className="rounded-full object-cover overflow-hidden w-8 h-8"
              width={32}
              height={32}
            />
            <div className="text-sm text-[#fdd52f]">
              {msg.sender && (msg.sender as userInfo).name}
            </div>
          </div>
          {msg.time && <div className="text-sm text-[#fdd52f]">
            {/* {msg.time.toString()} */}
            {postTime}
          </div>}
        </div>

        <div className="flex flex-col 3xs:flex-row w-full border-[1px] border-[#fdd52f] rounded-lg object-cover overflow-hidden items-start justify-start p-3 gap-3">
          {(msg?.img !== undefined) && (
            <Image
              src={msg?.img ? msg.img : UserIcon}
              className="rounded-lg"
              alt="Token IMG"
              width={200}
              height={300}
            />
          )}
          <div className="w-full h-full flex flex-col text-[#fdd52f] font-semibold text-sm">
            {msg.msg}
          </div>
        </div>
      </div>
    </div>
  );
};
