"use client"
import Link from 'next/link';
import { coinInfo } from "@/utils/types";
import { FC } from "react";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import { TbWorld } from "react-icons/tb";

interface TokenDataProps {
	data: coinInfo;
}

const SocialList: FC<TokenDataProps> = ({ data }) => {

	return (
		<div className="flex flex-row gap-4 px-2 justify-center">
			{(data?.twitter && data?.twitter !== undefined) &&
				<Link href={data?.twitter} legacyBehavior passHref>
					<a
						target="_blank"
						rel="noopener noreferrer"
						className="text-2xl text-[#fdd52f] hover:bg-[#fdd52f]/5 p-2 cursor-pointer rounded-full border-[1px] border-[#fdd52f]"
					>
						<FaXTwitter />
					</a>
				</Link>
			}
			{(data?.telegram && data?.telegram !== undefined) &&
				<Link href={data?.telegram} legacyBehavior passHref>
					<a
						target="_blank"
						rel="noopener noreferrer"
						className="text-2xl text-[#fdd52f] hover:bg-[#fdd52f]/5 p-2 cursor-pointer rounded-full border-[1px] border-[#fdd52f]"
					>
						<FaTelegramPlane />
					</a>
				</Link>
			}
			{(data?.website && data?.website !== undefined) &&
				<Link href={data?.website} legacyBehavior passHref>
					<a
						target="_blank"
						rel="noopener noreferrer"
						className="text-2xl text-[#fdd52f] hover:bg-[#fdd52f]/5 p-2 cursor-pointer rounded-full border-[1px] border-[#fdd52f]"
					>
						<TbWorld />
					</a>
				</Link>
			}
		</div>
	);
};

export default SocialList;
