"use client"
import React, { useContext } from 'react'

export default function Footer() {
  return (
    <div className='w-full h-20 bg-black flex flex-col relative items-center justify-center border-t-[1px] border-[#fdd52f]'>
      <div className='container mx-auto'>
        <div className='w-full h-full flex flex-row justify-between px-5 items-center text-[#fdd52f] '>
          <div className='text-sm mx-auto'>
            2025 @ CatLove Pump.fun : <a href='/'></a>
          </div>
          <div className='text-sm mx-auto'>
            Support<a href='/'></a>
          </div>
        </div>
      </div>
    </div>
  )
}
