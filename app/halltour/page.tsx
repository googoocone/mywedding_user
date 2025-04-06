"use client";

import HallCard from "@/components/pages/halltour/HallCard";
import HallFilter from "@/components/pages/halltour/HallFilter";
import HallSwiper from "@/components/pages/halltour/HallSwiper";
import HallViewed from "@/components/pages/halltour/HallViewed";
import MobileHallFilter from "@/components/pages/halltour/MobileHallFilter";
import { weddingHallList } from "@/constants";
import { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { GiSettingsKnobs } from "react-icons/gi";
import { useWeddingFilterStore } from "@/store/useWeddingFilterStore";

import SearchBar from "@/components/common/SearchBar";

const hotKeywords = ["르비르모어", "아모르하우스", "더채플엣논현", "w웨딩"];

export default function Halltour() {
  const selectedRegion = useWeddingFilterStore((state) => state.selectedRegion);
  const selectedSubRegion = useWeddingFilterStore(
    (state) => state.selectedSubRegion
  );
  const selectedWeddingType = useWeddingFilterStore(
    (state) => state.selectedWeddingType
  );
  const selectedFlower = useWeddingFilterStore((state) => state.selectedFlower);
  const searchTerm = useWeddingFilterStore((state) => state.searchTerm);
  const appliedSearchTerm = useWeddingFilterStore(
    (state) => state.appliedSearchTerm
  );
  const setSearchTerm = useWeddingFilterStore((state) => state.setSearchTerm);
  const setAppliedSearchTerm = useWeddingFilterStore(
    (state) => state.setAppliedSearchTerm
  );

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredWeddingHalls =
    appliedSearchTerm.trim() !== ""
      ? weddingHallList.filter((hall) =>
          hall.name.toLowerCase().includes(appliedSearchTerm.toLowerCase())
        )
      : weddingHallList.filter((hall) => {
          const regionMatch = hall.locationType[0] === selectedRegion;
          const subRegionMatch = selectedSubRegion
            ? hall.locationType.includes(selectedSubRegion)
            : true;
          let weddingTypeMatch = true;
          if (selectedWeddingType !== "전체") {
            weddingTypeMatch = hall.hallType
              .flatMap((item) => item.split(","))
              .map((item) => item.trim())
              .includes(selectedWeddingType);
          }
          const flowerMatch =
            selectedFlower === "전체" ||
            (hall.flower && hall.flower.includes(selectedFlower));

          return (
            regionMatch && subRegionMatch && weddingTypeMatch && flowerMatch
          );
        });

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
  };

  return (
    <div className="mt-[80px] w-full ">
      {/* 검색창 부분 */}
      <div className="w-full sm:w-[1400px] max-w-full h-[90px] px-4 mb-5 sm:px-[80px] mx-auto flex flex-col items-center justify-center bg-white">
        <div className="w-full sm:w-[500px] h-[50px] border border-gray-300 rounded-full flex items-center">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="flex-1 h-full rounded-full focus:outline-none pl-4"
            placeholder="웨딩홀을 입력해주세요"
            type="text"
          />
          <AiOutlineSearch
            onClick={handleSearch}
            className="text-xl mr-4 cursor-pointer"
          />
        </div>
        <div className="w-full sm:w-[500px] h-[40px] flex items-center justify-center overflow-hidden mx-auto gap-1">
          <div className="text-[10px] xs:text-[12px] sm:text-[14px] text-black/80 font-semibold px-1">
            인기 검색어
          </div>
          {hotKeywords.map((item, index) => (
            <div
              key={index}
              className="text-[10px] xs:text-[12px] sm:text-[14px] text-gray-500 px-1"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* 슬라이드 부분 */}
      <HallSwiper />

      {/* 모바일 필터 버튼 */}
      <button
        onClick={() => setMobileFilterOpen(true)}
        className="sm:hidden fixed bottom-0 left-0 w-full z-40 px-4 py-3 bg-white border-y border-gray-200 flex items-center justify-center gap-2"
      >
        <GiSettingsKnobs /> 필터
      </button>

      {/* 모바일 필터 모달 */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md p-4 rounded-lg relative">
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="absolute top-2 right-2 text-xl font-bold"
            >
              ×
            </button>
            <MobileHallFilter onClose={() => setMobileFilterOpen(false)} />
          </div>
        </div>
      )}

      {/* 컨텐츠 부분 */}
      <div className="w-[1400px] mt-3 max-w-full flex items-start justify-center mx-auto">
        {/* 좌측 필터 영역 */}
        <div className="w-[270px] max-h-[calc(100vh-120px)] scrollbar-hidden overflow-y-auto  hidden sm:block sticky top-[100px] self-start">
          <div>
            <HallFilter />
          </div>
        </div>
        {/* 메인 콘텐츠 영역 */}
        <div className="w-[750px] flex flex-wrap items-center justify-center gap-5">
          {filteredWeddingHalls.map((hall) => (
            <HallCard key={hall.id} data={hall} />
          ))}
        </div>

        {/* 우측 viewed */}
        <div className="hidden md:flex">
          <div className="w-[250px] sticky top-0 self-start "></div>
          <div className="flex-1 h-[3000px] "></div>
        </div>
      </div>
    </div>
  );
}
