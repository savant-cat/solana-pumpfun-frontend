"use client";
import { FC, useState } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { coinInfo } from "@/utils/types";
import FilterListButton from "../others/FilterListButton";

interface TokenDataProps {
  firstData: coinInfo[];
  tokenData: coinInfo[];
  setData: React.Dispatch<React.SetStateAction<coinInfo[]>>;
}

const FilterList: FC<TokenDataProps> = ({ firstData, tokenData, setData }) => {
  const [token, setToken] = useState("");

  const searchToken = (value: string) => {
    if (!value.trim()) {
      setData(firstData); // Reset to original list if input is empty
      return;
    }

    const filteredData = tokenData.filter((item) =>
      Object.keys(item).some((key) => {
        const propertyValue = item[key as keyof coinInfo];

        // Only check string, number, or date properties
        if (typeof propertyValue === "string" || typeof propertyValue === "number" || propertyValue instanceof Date) {
          return propertyValue.toString().toLowerCase().includes(value.toLowerCase());
        }

        return false;
      })
    );

    setData(filteredData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToken(value);
    searchToken(value); // Trigger filtering on each input change
  };

  return (
    <div className="w-full gap-4 h-full flex flex-col text-[#fdd52f] px-2 pt-4">
      <div className="flex flex-col w-full h-full gap-4">
        <div className="w-full max-w-[720px] flex flex-row items-center gap-1 pl-2 border-[1px] border-[#fdd52f] rounded-lg text-[#fdd52f] mx-auto object-cover overflow-hidden">
          <BiSearchAlt className="text-4xl text-[#fdd52f]" />
          <input
            type="text"
            value={token}
            placeholder="Search for Token"
            onChange={handleInputChange}
            className="bg-grey-400 w-full py-1 outline-none bg-transparent"
          />
          <div className="text-[#fdd52f] font-bold px-6 py-2 border-l-[1px] border-l-[#fdd52f] bg-[#fdd52f]/5">Search</div>
        </div>
        <div className="flex flex-col w-full max-w-[720px] md:flex-row gap-3 mx-auto">
          <FilterListButton filterData={tokenData} setData={setData} />
        </div>
      </div>
    </div>
  );
};

export default FilterList;
