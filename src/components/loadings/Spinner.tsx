import { FC } from "react";
import Image from "next/image";
import Head from "next/head";
import Logo from "@/../public/assets/logo-light.png"

const Spinner: FC = () => {
  return (
    <>
      <div className="h-screen w-screen fixed z-50">
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-lg z-50">
          <div className="flex flex-col items-center relative">

            {/* Loading Title */}
            <div className="flex flex-col items-center justify-center h-full bg-transparent text-center font-raleway gap-4">
              <Image src={Logo} alt="Logo" width={140} height={140} className="rounded-full border-[#fdd52f] border-[2px] shadow-[0px_8px_8px_0px] shadow-[#fdd52f]" />
              <span className="loader"></span>

            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Spinner;

