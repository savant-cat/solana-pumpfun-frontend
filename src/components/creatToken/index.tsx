"use client";
import {
  ChangeEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/loadings/Spinner";
import { errorAlert } from "@/components/others/ToastGroup";
import { useSocket } from "@/contexts/SocketContext";
import { createToken } from "@/program/web3";
import { createCoinInfo, launchDataInfo, metadataInfo } from "@/utils/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { uploadImage, uploadMetadata } from "@/utils/fileUpload";
import ImageUpload from "../upload/ImageUpload";
import { TbWorld } from "react-icons/tb";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

export default function CreateToken() {
  const { isLoading, setIsLoading } = useSocket();
  const [newCoin, setNewCoin] = useState<createCoinInfo>({} as createCoinInfo);

  const [profilImageUrl, setProfileIamgeUrl] = useState<string>("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const wallet = useWallet();
  const router = useRouter();
  const [errors, setErrors] = useState({
    name: false,
    ticker: false,
    image: false,
  });

  useEffect(() => {
    // Clear errors when newCoin changes
    setErrors({
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      image: !profilImageUrl,
    });
  }, [newCoin, profilImageUrl]);

  const handleToRouter = (path: string) => {
    router.push(path);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCoin({ ...newCoin, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    const validationErrors = {
      name: !newCoin.name,
      ticker: !newCoin.ticker,
      description: !newCoin.description,
      image: !profilImageUrl,
    };
    setErrors(validationErrors);
    return !Object.values(validationErrors).includes(true);
  };

  const createCoin = async () => {
    console.log("imageUrl--->", profilImageUrl, profileImagePreview)
    if (!validateForm()) {
      errorAlert("Please fix the errors before submitting.");
      return;
    }
    try {
      setIsLoading(true);
      // Process image upload
      const uploadedImageUrl = await uploadImage(profilImageUrl);
      if (!uploadedImageUrl) {
        errorAlert("Image upload failed.");
        setIsLoading(false);
        return;
      }
      const jsonData: metadataInfo = {
        name: newCoin.name,
        symbol: newCoin.ticker,
        image: uploadedImageUrl,
        description: newCoin.description,
        presale: newCoin.presale,
        createdOn: "https://test.com",
        twitter: newCoin.twitter || undefined,   // Only assign if it exists
        website: newCoin.website || undefined,   // Only assign if it exists
        telegram: newCoin.telegram || undefined   // Only assign if it exists
      }
      // Process metadata upload
      const uploadMetadataUrl = await uploadMetadata(jsonData);
      if (!uploadMetadataUrl) {
        errorAlert("Metadata upload failed.");
        setIsLoading(false);
        return;
      }

      console.log("uploadMetadataUrl ===>", uploadMetadataUrl)

      const coinData: launchDataInfo = {
        name: newCoin.name,
        symbol: newCoin.ticker,
        uri: uploadMetadataUrl,
        decimals: 6,
        virtualReserves: 2_000_000_000,
        tokenSupply: 1_000_000_000_000,
        presale: newCoin.presale,
      }

      const res = await createToken(wallet, coinData);
      if (res === "WalletError" || !res) {
        errorAlert("Payment failed or was rejected.");
        setIsLoading(false);
        return;
      }
      router.push("/");
    } catch (error) {
      errorAlert("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formValid =
    newCoin.name &&
    newCoin.ticker &&
    newCoin.description &&
    profilImageUrl
  // newCoin.presale

  return (
    <div className="w-full mx-auto px-3 pt-10 pb-16">
      <div className="w-full flex flex-col gap-3 mx-4">
        <div onClick={() => handleToRouter("/")} className="w-[100px] cursor-pointer text-[#fdd52f] text-2xl flex flex-row items-center gap-2 pb-2 ">
          <IoMdArrowRoundBack />
          Back
        </div>
        <h2 className="text-center text-2xl xs:text-4xl font-bold text-[#fdd52f]">
          Solana Token Creator
        </h2>
        <div className="w-full text-center text-sm text-[#fdd52f] max-w-lg mx-auto">
          Create a new coin to pump
        </div>
      </div>
      <div className="w-full max-w-xl h-full justify-between items-start flex flex-col sm2:flex-row sm2:gap-10 mx-auto">
        <div className="w-full flex flex-col gap-4 py-5">
          <div className="flex flex-col gap-4 pt-6">
            <div>
              <label htmlFor="name" className="text-lg font-semibold text-[#fdd52f] flex flex-row gap-1">
                Token Name <p className="text-red-600">*</p>
              </label>
              <input
                id="name"
                type="text"
                value={newCoin.name || ""}
                onChange={handleChange}
                placeholder="input name"
                className={`block w-full p-2.5  rounded-lg bg-transparent text-[#fdd52f] outline-none border-[#fdd52f] border-[1px]`}
              />
            </div>

            <div>
              <label
                htmlFor="ticker"
                className="text-lg font-semibold text-[#fdd52f] flex flex-row gap-1"
              >
                Ticker <p className="text-red-600">*</p>
              </label>
              <input
                id="ticker"
                type="text"
                value={newCoin.ticker || ""}
                onChange={handleChange}
                placeholder="input ticker"
                className={`block w-full p-2.5 rounded-lg bg-transparent text-[#fdd52f] outline-none border-[#fdd52f] border-[1px]`}
              />
            </div>

            <div>
              <label htmlFor="description" className="text-lg font-semibold text-[#fdd52f] flex flex-row gap-1">
                Description <p className="text-red-600">*</p>
              </label>
              <textarea
                id="description"
                rows={2}
                value={newCoin.description || ""}
                onChange={handleChange}
                placeholder="input description ..."
                className={`block w-full p-2.5 min-h-[160px] rounded-lg bg-transparent text-[#fdd52f] outline-none border-[#fdd52f] border-[1px]`}
              />
            </div>

            <ImageUpload header="Project Profile Image" setFilePreview={(fileName) => setProfileImagePreview(fileName)} setFileUrl={(fileUrl) => setProfileIamgeUrl(fileUrl)} type="image/*" />

            <div>
              <label
                htmlFor="ticker"
                className="text-lg font-semibold text-[#fdd52f] flex flex-row gap-1"
              >
                Buy Token <p className="text-red-600">*</p> <p className="text-[12px]"> max = 95</p>
              </label>
              <input
                id="presale"
                type="number"
                value={newCoin.presale}
                onChange={handleChange}
                placeholder="input sol amount"
                className={`block w-full p-2.5 rounded-lg bg-transparent text-[#fdd52f] outline-none border-[#fdd52f] border-[1px]`}
              />
            </div>

            <div>
              <label htmlFor="name" className="text-lg font-semibold text-[#fdd52f]">
                Website (Optional)
              </label>
              <div className="w-full h-full flex flex-row border-[#fdd52f] border-[1px] rounded-lg">
                <div className="w-14 flex flex-col items-center justify-center border-r-[#fdd52f] border-r-[1px]">
                  <TbWorld className="text-2xl items-center justify-center text-[#fdd52f] mx-auto" />
                </div>
                <input
                  type="text"
                  id="website"
                  value={newCoin.website || ""}
                  onChange={handleChange}
                  className={`block w-full p-2.5 rounded-r-lg bg-transparent text-[#fdd52f] outline-none `}
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="text-lg font-semibold text-[#fdd52f]">
                Twitter (Optional)
              </label>
              <div className="w-full h-full flex flex-row border-[#fdd52f] border-[1px] rounded-lg">
                <div className="w-14 flex flex-col items-center justify-center border-r-[#fdd52f] border-r-[1px]">
                  <FaXTwitter className="text-2xl items-center justify-center text-[#fdd52f] mx-auto" />
                </div>
                <input
                  type="text"
                  id="twitter"
                  value={newCoin.twitter || ""}
                  onChange={handleChange}
                  className={`block w-full p-2.5 rounded-r-lg bg-transparent text-[#fdd52f] outline-none`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="text-lg font-semibold text-[#fdd52f]">
                Telegram (Optional)
              </label>
              <div className="w-full h-full flex flex-row border-[#fdd52f] border-[1px] rounded-lg">
                <div className="w-14 flex flex-col items-center justify-center border-r-[#fdd52f] border-r-[1px]">
                  <FaTelegramPlane className="text-2xl items-center justify-center text-[#fdd52f] mx-auto" />
                </div>
                <input
                  type="text"
                  id="telegram"
                  value={newCoin.telegram || ""}
                  onChange={handleChange}
                  className={`block w-full p-2.5 rounded-r-lg bg-transparent text-[#fdd52f] outline-none`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={createCoin}
        disabled={!formValid || isLoading}
        className={`w-40 flex flex-col py-2 mt-16 mb-10 mx-auto px-8 border-[1px] border-[#fdd52f] rounded-full text-[#fdd52f] ${!formValid ? "opacity-50 cursor-not-allowed" : "hover:custom-gradient hover:bg-[#fdd52f]/30"}`}
      >
        {isLoading ? "Creating..." : "Create Coin"}
      </button>
      {isLoading && <Spinner />}
    </div >
  );
}
