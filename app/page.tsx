"use client";

import Slider from "@/components/common/Slider";
import Image from "next/image";
import Motion from "@/components/pages/home/motion";
import DynamicTitle from "@/components/pages/home/dynamicTitle";
import SearchBar from "@/components/common/SearchBar";
import Link from "next/link";

const hotSearch = [
  "르비르모어 강남",
  "더채플앳 논현",
  "모던하우스",
  "메리스에이프릴",
];

const guideMenu = [
  {
    title: "웨딩 로드맵",
    icon: "/roadmap.png",
  },
  {
    title: "상견례",
    icon: "/meeting.png",
    url: "https://blog.naver.com/wedding-march/223869712777",
  },
  {
    title: "웨딩홀 투어",
    icon: "/wedding.png",
    url: "https://blog.naver.com/wedding-march/223871085397",
  },
  {
    title: "드레스샵 투어",
    icon: "/dress.png",
    url: "https://blog.naver.com/wedding-march/223877498289",
  },
  { title: "스튜디오 상담", icon: "/studio.png" },
];

export default function Home() {
  return (
    <div className="w-full h-full sm:min-h-[800px] flex flex-col items-center justify-start relative">
      {/* 메인화면 */}
      <div className="w-full sm:h-[100vh]">
        <div className=" w-full h-[45px] sm:h-[60px] bg-[#e5e7eb] text-[10px] xs:text-[12px] sm:text-[16px] flex items-center justify-center mt-[70px] sm:mt-0">
          🤬 결혼 준비하다 <strong className="mx-1"> 빡친 예비신부가 </strong>{" "}
          직접 만든 본격 결혼준비 플랫폼! 🤬
        </div>
        <div className="w-full h-[820px] sm:h-full flex flex-col items-center justify-center  gap-30 px-5">
          <div className="w-full sm:w-[780px] h-[220px] sm:h-[180px]  flex flex-col items-center justify-between">
            <div className="w-full sm:text-center ">
              <DynamicTitle></DynamicTitle>
            </div>
            <div className="w-full h-[80px] flex sm:flex-row flex-col items-start sm:items-center justify-between gap-3 sm:gap-0">
              {/* 버튼 */}
              <div className="w-[120px] h-full flex justify-start items-start">
                <button className="w-full h-[50px] rounded-full bg-[#ff767b] font-semibold text-[15px] text-white flex gap-1 items-center justify-center">
                  서울시
                  <Image src="/arrow.png" width={17} height={17} alt=""></Image>
                </button>
              </div>
              {/* 검색창 */}
              <div className="w-full sm:w-[640px] h-full">
                <SearchBar></SearchBar>
                <div className="w-full flex items-center justify-center text-[9px] xs:text-[11px] sm:text-[14px] gap-3 mt-2">
                  인기 검색어{" "}
                  {hotSearch.map((item, index) => (
                    <div key={index} className="text-black/50">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-[680px] h-[320px] sm:h-[180px]  sm:flex flex-col items-center justify-between text-[18px]">
            <h2 className="hidden sm:block font-medium">
              My Wedding Diary에서 알려드리는 결혼식 완벽 준비
            </h2>
            <div className="w-full h-[100px] flex items-center justify-between flex-wrap gap-2">
              {guideMenu.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[48%] h-[100px] sm:w-[120px] sm:h-[120px] p-2 rounded-lg shadow-lg text-black/50 hover:text-black duration-300 bg-white flex flex-col items-center justify-between cursor-pointer"
                >
                  <div className="w-full h-[27px] flex items-center justify-start">
                    <Image
                      src={item.icon}
                      width={32}
                      height={32}
                      alt={item.title}
                    />
                  </div>
                  <div className="w-full mt-6 font-semibold text-[16px] text-right">
                    {item.title}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-5 bg-gray-100"></div>
      <div className="w-full h-[200px] sm:h-[260px] flex flex-col items-center justify-evenly gap-5">
        <div className="text-[16px] sm:text-2xl font-semibold text-center text-black/60">
          지금 바로 확인할 수 있는 웨딩홀 견적
        </div>
        <div className="w-full md:w-[1200px] sm:h-[150px] mx-auto">
          <Slider />
        </div>
      </div>
      <button className="w-[120px] h-[50px] sm:w-[150px] sm:h-[60px] z-10 bg-[#434343] text-white text-[14px] fixed bottom-10 rounded-full transition-all duration-200 hover:text-[15px] hover:font-semi cursor-pointer">
        <Link href="/halltour">전체 웨딩홀 보기</Link>
      </button>
      <div className="w-full h-5 bg-gray-100"></div>

      <Motion></Motion>
    </div>
  );
}
