"use client"
import React from 'react'
import { AdminSocialData } from '@/config/TextData'

export default function AdminSocialList() {
  return (
    <div className='flex flex-row gap-2 items-center text-[#fdd52f]'>
      {AdminSocialData.map((item: any, index: number) => {
        return (
          <a href={`${item.url}`} key={index} className='flex flex-col border-[1px] border-[#fdd52f]/10 hover:border-[#fdd52f]/40 bg-[#fdd52f]/5 hover:bg-[#fdd52f]/30 rounded-full text-xl p-2'>
            {item.icon}
          </a>
        )
      })}
    </div>
  )
}
