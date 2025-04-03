"use client"
import { FC, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UserContext from "@/context/UserContext";
import { coinInfo } from "@/utils/types";
import { getCoinsInfo, getSolPriceInUSD, test } from "@/utils/util";
import { CoinBlog } from "../cards/CoinBlog";
import TopToken from "./TopToken";
import FilterList from "./FilterList";
import Spinner from "../loadings/Spinner";
import { useSocket } from "@/contexts/SocketContext";

const HomePage: FC = () => {
  const { isLoading, setIsLoading, isCreated, solPrice, setSolPrice } = useContext(UserContext);
  const { newToken } = useSocket();

  const [data, setData] = useState<coinInfo[]>([]);
  const [firstData, setFirstData] = useState<coinInfo[]>([]);
  const [isSort, setIsSort] = useState(0);
  const dropdownRef = useRef(null);
  const dropdownRef1 = useRef(null);
  const router = useRouter()

  const handleToRouter = (id: string) => {
    setIsLoading(true)
    router.push(id)
  }

  const getData = () => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const coins = await getCoinsInfo();
        const price = await getSolPriceInUSD();
        const userLogin = await test();
        console.log("coins--->", coins)
        if (coins && coins !== null) {
          coins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setData(coins);
          setFirstData(coins)
          setSolPrice(price);
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchData();
  }

  useEffect(() => {
    getData()
  }, []);

  useEffect(() => {
    if (newToken) {
      if (newToken && typeof newToken === 'object') {
        console.log("newToken ===>", newToken)
        setData((prev) => [newToken as unknown as coinInfo, ...prev]);
      }
    }
  }, [newToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        dropdownRef1.current && !dropdownRef1.current.contains(event.target)
      ) {
        setIsSort(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, dropdownRef1]);

  return (
    <div className="w-full h-full gap-4 flex flex-col py-14 relative">
      <TopToken data={data} />
      <FilterList firstData={firstData} tokenData={data} setData={setData} />
      {data && (
        <div className="w-full h-full flex flex-wrap gap-x-3 gap-y-8 items-center">
          {data.map((temp, index) => (
            <div key={index} onClick={() => handleToRouter(`/trading/${temp._id}`)} className="cursor-pointer mx-auto w-full max-w-[380px] shadow-lg shadow-[#000]/50 rounded-lg">
              <CoinBlog coin={temp} componentKey="coin"></CoinBlog>
            </div>
          ))}
        </div>
      )}
      {isLoading && <Spinner />}
    </div>
  );
};
export default HomePage;
