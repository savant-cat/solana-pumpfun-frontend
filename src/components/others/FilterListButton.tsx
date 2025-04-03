"use client"
import { coinInfo } from "@/utils/types";
import { FC } from "react";
import { CiFilter } from "react-icons/ci";

interface TokenDataProps {
  filterData: coinInfo[];
  setData: React.Dispatch<React.SetStateAction<coinInfo[]>>;
}

const FilterListButton: FC<TokenDataProps> = ({ filterData, setData }) => {
  const FilterText = [
    { id: "last reply", text: "Last Reply" },
    { id: "creation time", text: "Creation Time" },
    { id: "market cap", text: "Market Cap" },
  ];

  const handleSortSelection = (filterOption: string) => {
    let sortedData = [...filterData]; // Create a new array to prevent direct state mutation

    if (filterOption === "last reply") {
      sortedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (filterOption === "market cap") {
      sortedData.sort((a, b) => b.progressMcap - a.progressMcap);
    } else if (filterOption === "creation time") {
      sortedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    setData(sortedData);
  };

  return (
    <div className="w-full flex flex-col xs:flex-row gap-3 items-center justify-between">
      {FilterText.map((item) => (
        <div
          key={item.id}
          onClick={() => handleSortSelection(item.id)}
          className="w-full gap-2 flex flex-row items-center border-[1px] border-[#fdd52f] hover:bg-[#fdd52f]/30 text-[#fdd52f] font-semibold py-2 rounded-lg justify-center cursor-pointer text-lg"
        >
          <p className="text-sm">{item.text}</p>
          <CiFilter />
        </div>
      ))}
    </div>
  );
};

export default FilterListButton;
