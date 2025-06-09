"use client";

import { useState } from "react";
import MyPage from "@/components/pages/users/MyPage";
import classNames from "classnames";
import Likes from "@/components/pages/users/Likes";

export default function users() {
  const [isSelected, setIsSelected] = useState("내정보");
  console.log("isSelected", isSelected);

  return (
    <div className="w-full h-full">
      <div className="w-full h-[50px]"></div>
      <div className="w-full h-[100px] flex items-center justify-center text-2xl">
        <div
          onClick={() => setIsSelected("내정보")}
          className={classNames(
            "w-[300px] h-full flex items-center justify-center text-gray-400 font-semibold hover:text-gray-900 cursor-pointer",
            { "text-gray-900": isSelected === "내정보" }
          )}
        >
          내 정보
        </div>
        <div className="w-[1px] h-[50px] bg-gray-300"></div>
        <div
          onClick={() => setIsSelected("찜")}
          className={classNames(
            "w-[300px] h-full flex items-center justify-center text-gray-400 font-semibold hover:text-gray-900 cursor-pointer",
            { "text-gray-900": isSelected === "찜" }
          )}
        >
          {isSelected === "찜" ? <span>찜❤️</span> : <span>찜🩶</span>}
        </div>
      </div>
      <div className="w-[700px] h-[1px] bg-gray-200 mx-auto"></div>
      {isSelected == "내정보" ? <MyPage></MyPage> : <Likes></Likes>}
    </div>
  );
}
