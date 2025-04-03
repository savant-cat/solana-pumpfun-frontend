"use client";
import { FC, useContext, useEffect, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import { successAlert, errorAlert } from "@/components/others/ToastGroup";
import base58 from "bs58";
import UserContext from "@/context/UserContext";
import { confirmWallet, walletConnect } from "@/utils/util";
import { userInfo } from "@/utils/types";
import { useRouter } from "next/navigation";
import { RiExchangeDollarLine } from "react-icons/ri";
import { VscDebugDisconnect } from "react-icons/vsc";
import { FaWallet } from "react-icons/fa";
import { TbMoodEdit } from "react-icons/tb";
import UserAvatar from "@/../public/assets/images/user-avatar.png"
import jwt, { JwtPayload } from 'jsonwebtoken';


export const ConnectButton: FC = () => {
  const { user, setUser, login, setLogin, setIsLoading, isLoading } =
    useContext(UserContext);
  const { publicKey, disconnect, connect, signMessage, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter()

  const tempUser = useMemo(() => user, [user]);

  useEffect(() => {
    const handleClick = async () => {
      if (publicKey && !login) {
        const updatedUser: userInfo = {
          name: publicKey.toBase58().slice(0, 6),
          wallet: publicKey.toBase58(),
          isLedger: false,
        };
        console.log("updatedUser ===>", updatedUser)

        let userDatas = await sign(updatedUser);
        console.log("userDatas ==>", userDatas)
      }
    };
    handleClick();

  }, [publicKey, login]); // Removed `connect`, `wallet`, and `disconnect` to prevent unnecessary calls

  const sign = async (updatedUser: userInfo) => {
    try {
      const connection = await walletConnect({ data: updatedUser });
      if (!connection) return;
      if (connection.nonce === undefined) {
        const newUser = {
          name: connection.name,
          wallet: connection.wallet,
          _id: connection._id,
          avatar: connection.avatar,
        };
        setUser(newUser as userInfo);
        setLogin(true);
        return;
      }

      const msg = new TextEncoder().encode(
        `agentland ${connection.nonce}`
      );

      console.log("user.avatar ==>", user.avatar)

      const sig = await signMessage?.(msg);
      const res = base58.encode(sig as Uint8Array);
      const signedWallet = { ...connection, signature: res };
      const confirm = await confirmWallet({ data: signedWallet });

      if (confirm) {
        setUser(confirm);
        setLogin(true);
        setIsLoading(false);
      }
      successAlert("Message signed.");
    } catch (error) {
      errorAlert("Sign-in failed.");
    }
  };

  const logOut = async () => {
    if (typeof disconnect === "function") {
      await disconnect();
    }
    // Initialize `user` state to default value
    setUser({} as userInfo);
    setLogin(false);
    localStorage.clear();
  };

  const handleToProfile = (id: string) => {
    router.push(id)
    setIsLoading(true)
  }

  return (
    <div>
      <button className={`${isLoading ? "" : "z-30"} flex flex-row gap-1 items-center justify-end text-white px-4 py-2 rounded-full border-[1px] border-[#fdd52f] group relative bg-[#fdd52f]/5 hover:bg-[#fdd52f]/30`}>
        {login && publicKey ? (
          <>
            <div className="flex items-center justify-center gap-2 text-[16px] lg:text-md">
              <Image
                src={(user.avatar !== "https://scarlet-extra-cat-880.mypinata.cloud/" && user.avatar !== "" && user.avatar !== undefined && user.avatar !== null && user.avatar) ? user.avatar : UserAvatar}
                alt="Token IMG"
                className="rounded-full object-cover overflow-hidden w-[35px] h-[35px] border-[1px] border-[#fdd52f]"
                width={35}
                height={35}
              />
              {user?.name ?
                <div className="w-[92px] object-cover overflow-hidden truncate text-[#fdd52f]">
                  {user.name}
                </div>
                :
                <div className="text-[#fdd52f]">
                  {publicKey.toBase58().slice(0, 4)}....
                  {publicKey.toBase58().slice(-4)}
                </div>
              }
              <TbMoodEdit onClick={() => handleToProfile(`/profile/${tempUser._id}`)} className="text-2xl text-[#fdd52f]" />
            </div>
            <div className="w-full absolute right-0 -bottom-[88px] hidden rounded-lg group-hover:block px-3">
              <ul className="border-[0.75px] border-[#fdd52f] rounded-lg bg-none object-cover overflow-hidden bg-black text-[#fdd52f]">
                <li>
                  <div
                    className="flex flex-row gap-1 items-center mb-1 text-primary-100 text-md p-2 hover:bg-[#fdd52f]/30"
                    onClick={() => setVisible(true)}
                  >
                    <RiExchangeDollarLine />
                    Change Wallet
                  </div>
                </li>
                <li>
                  <div
                    className="flex gap-1 items-center text-primary-100 text-md p-2 hover:bg-[#fdd52f]/10"
                    onClick={logOut}
                  >
                    <VscDebugDisconnect />
                    Disconnect
                  </div>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div
            className="flex flex-row gap-2 items-center justify-center text-md text-[#fdd52f]"
            onClick={() => setVisible(true)}
          >
            <FaWallet />
            Connect Wallet
          </div>
        )}
      </button>
    </div>
  );
};
