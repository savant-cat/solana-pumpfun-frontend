"use client";
import { CoinBlog } from "@/components/cards/CoinBlog";
import Modal from "@/components/modals/Modal";
import { errorAlert, successAlert } from "@/components/others/ToastGroup";
import UserContext from "@/context/UserContext";
import { coinInfo, userInfo } from "@/utils/types";
import { getCoinsInfoBy, getUser } from "@/utils/util";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import { LuFileEdit } from "react-icons/lu";
import { MdContentCopy } from "react-icons/md";
import { ProfileMenuList } from "@/config/TextData";
import TestUser from "@/../public/assets/images/user-avatar.png"
import { IoMdArrowRoundBack } from "react-icons/io";
import Spinner from "../loadings/Spinner";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";

export default function ProfilePage() {
  const { setProfileEditModal, profileEditModal, isLoading, setIsLoading, user } = useContext(UserContext);
  const { publicKey } = useWallet();
  const pathname = usePathname();
  const [param, setParam] = useState<string | null>(null);
  const [userData, setUserData] = useState<userInfo>({} as userInfo);
  const [option, setOption] = useState<number>(1);
  const [coins, setCoins] = useState<coinInfo[]>([]);
  const [copySuccess, setCopySuccess] = useState<string>("");
  const router = useRouter();

  const handleToRouter = (id: string) => {
    if (id.startsWith("http")) {
      window.location.href = id; // For external links
    } else {
      router.push(id); // For internal routing
    }
  };

  const fetchUserData = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await getUser({ id });
      setUserData(response);
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching user:", error);
      setIsLoading(false)
    }
  };

  const fetchCoinsData = async (userId: string) => {
    try {
      const coinsBy = await getCoinsInfoBy(userId);
      console.log("coinsBy data ===>", coinsBy)
      setCoins(coinsBy);
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  };

  useEffect(() => {
    console.log("profile user data ==> ", user)
    setUserData(user);

  }, [user])

  useEffect(() => {
    const segments = pathname.split("/");
    console.log("segments ==> ", segments)
    const id = segments[segments.length - 1];
    console.log("segments id ==> ", id)
    if (id && id !== param) {
      setParam(id);
      fetchUserData(id);
    }
  }, [pathname]);

  useEffect(() => {
    if (option === 4 && param) {
      fetchCoinsData(param);
    }
  }, [option, param]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess("Copied!");
      successAlert("Copied to clipboard!");
    } catch (err) {
      setCopySuccess("Failed to copy!");
      errorAlert("Failed to copy!");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 px-2 py-10">
      <div onClick={() => handleToRouter("/")} className="w-[100px] cursor-pointer text-[#fdd52f] text-2xl flex flex-row items-center gap-2 pb-2">
        <IoMdArrowRoundBack />
        Back
      </div>
      <div className="grid gap-6 justify-center">
        <div className="flex flex-col xs:flex-row gap-6 mx-auto justify-center items-center">
          <div className="w-full rounded-full relative flex flex-col border-[1px] border-[#fdd52f] shadow-[#fdd52f]/50 shadow-[0px_4px_4px_0px]">
            <Image
              src={(user.avatar !== "https://scarlet-extra-cat-880.mypinata.cloud/" && user.avatar !== "" && user.avatar !== undefined && user.avatar !== null && user.avatar) ? userData.avatar : TestUser.src}
              alt="Avatar"
              width={120}
              height={120}
              className="object-cover w-[120px] h-[120px] rounded-full mx-auto blur-sm "
            />
            <Image
              src={(user.avatar !== "https://scarlet-extra-cat-880.mypinata.cloud/" && user.avatar !== "" && user.avatar !== undefined && user.avatar !== null && user.avatar) ? userData.avatar : TestUser.src}
              alt="Avatar"
              width={104}
              height={104}
              className="absolute object-cover w-[104px] h-[104px] rounded-full mx-auto top-[8px] left-[8px] border-[#fdd52f] border-[1px]"
            />
          </div>
          <div className="w-full flex flex-col text-[#fdd52f] font-bold gap-2">
            <div className="flex flex-row items-center text-xl gap-2 justify-center xs:justify-start">
              @ {userData.name ? userData.name : publicKey?.toBase58().slice(0, 6)}
              <LuFileEdit
                onClick={() => setProfileEditModal(true)}
                className="cursor-pointer text-2xl hover:text-[#fdd52f]/70 text-[#fdd52f]"
              />
            </div>
            <div
              className="flex flex-col w-[165px] text-lg cursor-pointer text-[#fdd52f] border-b-[#fdd52f] border-b-[1px] px-2 justify-center xs:justify-start"
              onClick={() => handleToRouter(`https://solscan.io/account/${userData.wallet}`)}
            >
              View on Solscan
            </div>
          </div>
        </div>
        <div className="w-[94%] flex flex-row items-center gap-2 border-[1px] border-[#fdd52f] rounded-lg px-2 xs:px-3 py-1 xs:py-2 font-semibold text-[#fdd52f] mx-auto object-cover overflow-hidden">
          <p className="w-[92%] object-cover overflow-hidden truncate ">{userData.wallet ? userData.wallet : publicKey?.toBase58()}</p>
          <MdContentCopy
            className="text-2xl text-[#fdd52f] cursor-pointer"
            onClick={() => copyToClipboard(userData.wallet)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1 xs:gap-2 rounded-lg xs:rounded-full p-1 text-white text-sm sm:text-lg font-semibold border-[#fdd52f] border-[1px] mx-auto">
        {ProfileMenuList.map((item) => (
          <div
            key={item.id}
            onClick={() => setOption(item.id)}
            className={`${option === item.id ? "bg-[#fdd52f]/30" : "bg-none hover:bg-[#fdd52f]/5 "
              } rounded-lg xs:rounded-full px-5 py-2 font-semibold cursor-pointer mx-auto capitalize text-[#fdd52f]`}
          >
            {item.text}
          </div>
        ))}
      </div>
      {profileEditModal && <Modal data={userData} />}
      <div>

        {option === 4 && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-6 max-w-[950px] mx-auto">
            {coins.map((coin) => (
              <div
                key={coin.token}
                onClick={() => handleToRouter(`/trading/${coin._id}`)}
                className="cursor-pointer"
              >
                <CoinBlog coin={coin} componentKey="coin" />
              </div>
            ))}
          </div>
        )}
      </div>
      {isLoading && <Spinner />}
    </div>
  );
}
