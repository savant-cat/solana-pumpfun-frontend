"use client";
import HomePage from "@/components/home";
export default function Home() {

  return (
    <div className="w-full h-full min-h-[calc(100vh-100px)] flex flex-col relative object-cover overflow-hidden">
      <div className="max-w-[1240px] mx-auto w-full h-full z-20">
        <HomePage />
      </div>
    </div>
  );
}
