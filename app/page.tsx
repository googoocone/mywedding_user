"use client";

import Slider from "@/components/common/Slider";
import Image from "next/image";
import Motion from "@/components/pages/home/motion";
import DynamicTitle from "@/components/pages/home/dynamicTitle";
import SearchBar from "@/components/common/SearchBar";
import { useRouter } from "next/navigation";
import { useWeddingFilterStore } from "@/store/useWeddingFilterStore";
import Link from "next/link";
import Halltour from "./halltour/page";

const hotSearch = [
  "르비르모어 강남",
  "더채플앳 논현",
  "모던하우스",
  "메리스에이프릴",
];

export default function Home() {
  const router = useRouter(); // ✅ useRouter 훅 사용
  const setSearchTerm = useWeddingFilterStore((state) => state.setSearchTerm);
  const setAppliedSearchTerm = useWeddingFilterStore(
    (state) => state.setAppliedSearchTerm
  );

  // ✅ 검색 처리 함수
  const handleSearch = (term: string) => {
    console.log("검색어:", term); // 디버깅용 로그
    setSearchTerm(term); // 스토어의 searchTerm 업데이트
    setAppliedSearchTerm(term); // 스토어의 appliedSearchTerm 업데이트 (즉시 적용되도록)
    router.push("/halltour"); // /halltour 페이지로 이동
  };

  return (
    <div className="w-full h-full sm:min-h-[800px] flex flex-col items-center justify-start relative">
      {/* 메인화면 */}
      <div className="w-full">
        <Link href="/story">
          <div className=" w-full h-[45px] sm:h-[60px] bg-[#e5e7eb] text-[10px] xs:text-[12px] sm:text-[16px] flex items-center justify-center mt-[70px] sm:mt-0">
            ❤️2026년 웨딩홀{" "}
            <span className="ml-1 font-semibold text-lg"> 하반기 견적서</span>가
            업데이트 중!❤️
          </div>
        </Link>
        {/* <div className="w-full h-[300px] sm:h-[180px] flex flex-col items-center justify-center  gap-30 px-5">
          <div className="w-full sm:w-[780px] h-[220px] sm:h-[180px]  flex flex-col items-center justify-center">
            <div className="w-full sm:text-center ">
              <DynamicTitle></DynamicTitle>
            </div>
            <div className="w-full h-[80px] flex sm:flex-row flex-col items-center sm:items-center justify-center gap-3 sm:gap-0">
              <div className="w-full sm:w-[640px] h-full">
                <SearchBar onSearch={handleSearch} />
                <div className="w-full flex items-center justify-center text-[9px] xs:text-[11px] sm:text-[14px] gap-3 mt-2">
                  인기 검색어
                  {hotSearch.map((item, index) => (
                    <div key={index} className="text-black/50">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
      <Halltour></Halltour>
    </div>
  );
}
