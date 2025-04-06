"use client";

import { useState } from "react";

import { CiShare1 } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { AiOutlineUnorderedList } from "react-icons/ai";

import Image from "next/image";

export default function PhotoSection({ data }: { data: any }) {
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  return (
    <>
      <h1 className="text-lg md:text-3xl font-semibold px-4">{data?.title}</h1>

      <div className="mt-6 relative">
        <div className="grid md:grid-cols-2 md:gap-4 gap-2 align-middle h-[400px] overflow-hidden md:rounded-lg">
          {/* 왼쪽 큰 이미지 */}
          <div className="relative w-full h-full col-span-1 row-span-2">
            {data?.images?.[0] && (
              <Image
                src={data.images[0]}
                alt="room img"
                style={{ objectFit: "cover" }}
                fill
                className="rounded-lg"
              />
            )}
          </div>

          {/* 오른쪽 작은 이미지 4개 */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full col-span-1 row-span-2">
            {data?.images?.slice(1, 5).map((img: any, index: any) => (
              <div key={index} className="relative w-full h-full">
                <Image
                  src={img}
                  alt={`room img ${index + 1}`}
                  style={{ objectFit: "cover" }}
                  fill
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 hover:shadow-lg text-black text-sm border-black  rounded-md absolute right-6 bottom-6 gap-2 flex items-center"
          onClick={() => setShowImageModal(true)}
        >
          <AiOutlineUnorderedList />
          사진 모두 보기
        </button>
      </div>
      <div className="flex w-full justify-between items-center px-4">
        <div className="underline font-medium text-xs md:text-s mt-2"></div>
        <div className="flex gap-2 text-xs md:text-sm mt-2">
          <button
            type="button"
            className="flex gap-2 items-center px-2 py-1.5 rounded-lg hover:bg-black/10"
          >
            <CiShare1 />
            공유하기
          </button>
          <button
            type="button"
            className="flex gap-2 items-center px-2 py-1.5 rounded-lg hover:bg-black/10"
          >
            <CiHeart />찜
          </button>
        </div>
      </div>
    </>
  );
}
