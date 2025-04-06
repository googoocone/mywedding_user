import Link from "next/link";
import cn from "classnames";

import { FaInstagram } from "react-icons/fa";

export default function OptionSection({ data }: any) {
  return (
    <div className="w-full flex flex-col items-start justify-center">
      <div className="text-xl font-[600] mb-4">옵션 사항</div>
      <div className="w-full flex items-center justify-center">
        {/* 이 부분이 기본정보의 요소들이 들어가는 부분 */}
        <div className="w-full  flex flex-col items-start gap-4">
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              생화장식
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.flowerPrice.price.map((item: any, index: number) => (
                  <div key={index}>{item.toLocaleString()}원</div>
                ))}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.flowerPrice.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item != "선택",
                      "text-gray-500": item == "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex w-[240px] gap-4 self-start">
                {data.flowerPrice.company.map((item: any, index: number) => (
                  <div className=" flex items-center justify-center gap-1">
                    <a
                      key={index}
                      href={data.flowerPrice.instagram[index]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaInstagram className="" />
                    </a>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              스냅사진
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.snapPhoto.price.map((item: any, index: any) => (
                  <div key={index}>{item.toLocaleString()}원</div>
                ))}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.snapPhoto.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item !== "선택",
                      "text-gray-500": item === "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex w-[250px] gap-4  ml-4">
                {data.snapPhoto.company.map((item: any, index: number) => (
                  <a
                    key={item}
                    href={data.snapPhoto.instagram[index]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <FaInstagram />
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              폐백
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.pyeback.price.map((item: any, index: any) => (
                  <div key={index}>{item.toLocaleString()}원</div>
                ))}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.pyeback.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item !== "선택",
                      "text-gray-500": item === "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              생화랩핑
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.flowerWrapping.price.length === 0
                  ? "서비스"
                  : data.flowerWrapping.price}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.flowerWrapping.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item !== "선택",
                      "text-gray-500": item === "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              플라워샤워
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.flowerShower.price.map((item: any, index: any) => (
                  <div key={index}>{item.toLocaleString()}원</div>
                ))}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.flowerShower.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item !== "선택",
                      "text-gray-500": item === "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              포토부스
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.photoBooth.price.map((item: any, index: any) => (
                  <div key={index}>{item.toLocaleString()}원</div>
                ))}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.photoBooth.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item !== "선택",
                      "text-gray-500": item === "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              주례
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.officiant.price.map((item: any, index: any) => (
                  <div key={index}>{item.toLocaleString()}원</div>
                ))}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.officiant.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item !== "선택",
                      "text-gray-500": item === "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              사회
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.mc.price.map((item: any, index: any) => (
                  <div key={index}>{item.toLocaleString()}원</div>
                ))}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.mc.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item !== "선택",
                      "text-gray-500": item === "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              축가
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-8">
              <div className="w-[200px] flex gap-2 flex-wrap">
                {data.weddingSong.price.map((item: any, index: any) => (
                  <div key={index}>{item.toLocaleString()}원</div>
                ))}
              </div>
              <div className="flex-shrink-0 self-start">
                {data.weddingSong.option.map((item: any, index: any) => (
                  <div
                    key={index}
                    className={cn({
                      "text-red-400": item !== "선택",
                      "text-gray-500": item === "선택",
                    })}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 ml-4"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
