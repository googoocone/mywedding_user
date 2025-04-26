"use client";

import HallCard from "@/components/pages/halltour/HallCard";
import HallFilter from "@/components/pages/halltour/HallFilter";
import HallSwiper from "@/components/pages/halltour/HallSwiper";
// import HallViewed from "@/components/pages/halltour/HallViewed"; // 사용되지 않는 것 같으면 삭제 고려
import { weddingHallList } from "@/constants"; // 필요없으면 삭제 고려
import { useState, useEffect, useMemo } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { GiSettingsKnobs } from "react-icons/gi";
import { useWeddingFilterStore } from "@/store/useWeddingFilterStore";
// 백엔드 응답 구조에 맞는 인터페이스 임포트
import { CompanyWithOneHallOut } from "@/interface/weddingData"; // 실제 경로 및 타입 확인
import MobileHallFilter from "@/components/pages/halltour/MobileHallFilter";

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

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false); // --- 백엔드에서 불러온 데이터를 저장하는 상태 값들 --- // // ✅ 이제 List<CompanyWithOneHallOut> 타입의 데이터가 저장됩니다.

  const [halls, setHalls] = useState<CompanyWithOneHallOut[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 유지
  const [error, setError] = useState<string | null>(null); // 에러 상태 유지

  useEffect(() => {
    const fetchWeddingHalls = async () => {
      try {
        // 백엔드 API 엔드포인트 URL
        const apiEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/hall/get_wedding_halls`; // 백엔드 라우터 경로 확인

        const response = await fetch(apiEndpoint, {
          headers: {
            "Content-Type": "application/json",
          }, // credentials: 'include', // 필요시 추가
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(
            `Failed to fetch halls: ${response.status} ${
              response.statusText
            } - ${errorBody.detail || ""}`
          );
        }

        // ✅ FIX: 백엔드 응답 타입을 CompanyWithOneHallOut[] 로 가정
        const data: CompanyWithOneHallOut[] = await response.json();
        console.log("halls_data", data);
        setHalls(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch wedding halls.");
        console.error("Error fetching wedding halls:", err);
      } finally {
        setIsLoading(false); // 로딩 완료 또는 에러 발생 시 로딩 상태 해제
      }
    };

    fetchWeddingHalls();
  }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때만 실행 // --- 필터링 로직 (useMemo 사용하여 성능 최적화) ---

  const filteredWeddingHalls = useMemo(() => {
    // ✅ FIX: 이제 halls는 CompanyWithOneHallOut 객체들의 리스트입니다.
    let filtered = halls;

    if (!filtered || filtered.length === 0) {
      return [];
    }

    if (appliedSearchTerm.trim() !== "") {
      const lowerSearchTerm = appliedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((company) => {
        const companyNameMatch = company.name
          ?.toLowerCase()
          .includes(lowerSearchTerm);
        const hallNameMatch = company.selected_hall?.name
          ?.toLowerCase()
          .includes(lowerSearchTerm);
        return companyNameMatch || hallNameMatch;
      });
    } else {
      filtered = filtered.filter((company) => company.selected_hall !== null);

      if (selectedRegion && selectedRegion !== "전체") {
        filtered = filtered.filter((company) => {
          const address = company.address || "";
          const regionMatch = address.includes(selectedRegion);

          if (
            regionMatch &&
            selectedSubRegion &&
            selectedSubRegion !== "전체"
          ) {
            return address.includes(selectedSubRegion);
          }

          return regionMatch;
        });
      }

      if (selectedWeddingType && selectedWeddingType !== "전체") {
        filtered = filtered.filter((company) => {
          return company.selected_hall?.type === selectedWeddingType;
        });
      }

      if (selectedFlower && selectedFlower !== "전체") {
        filtered = filtered.filter((company) => {
          return company.selected_hall?.mood === selectedFlower;
        });
      }
    }

    return filtered;
  }, [
    halls,
    appliedSearchTerm,
    selectedRegion,
    selectedSubRegion,
    selectedWeddingType,
    selectedFlower,
  ]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
  };

  return (
    <div className="mt-[80px] w-full ">
      {/* 검색창 부분 */}{" "}
      <div className="w-full sm:w-[1400px] max-w-full h-[90px] px-4 mb-5 sm:px-[80px] mx-auto flex flex-col items-center justify-center bg-white">
        {" "}
        <div className="w-full sm:w-[500px] h-[50px] border border-gray-300 rounded-full flex items-center">
          {" "}
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="flex-1 h-full rounded-full focus:outline-none pl-4"
            placeholder="웨딩홀을 입력해주세요"
            type="text"
          />{" "}
          <AiOutlineSearch
            onClick={handleSearch}
            className="text-xl mr-4 cursor-pointer"
          />{" "}
        </div>{" "}
        <div className="w-full sm:w-[500px] h-[40px] flex items-center justify-center overflow-hidden mx-auto gap-1">
          {" "}
          <div className="text-[10px] xs:text-[12px] sm:text-[14px] text-black/80 font-semibold px-1">
            인기 검색어{" "}
          </div>{" "}
          {hotKeywords.map((item, index) => (
            <div
              key={index}
              className="text-[10px] xs:text-[12px] sm:text-[14px] text-gray-500 px-1"
            >
              {item}{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>
      {/* 슬라이드 부분 */}
      <HallSwiper /> {/* 모바일 필터 버튼 */}{" "}
      <button
        onClick={() => setMobileFilterOpen(true)}
        className="sm:hidden fixed bottom-0 left-0 w-full z-40 px-4 py-3 bg-white border-y border-gray-200 flex items-center justify-center gap-2"
      >
        <GiSettingsKnobs /> 필터{" "}
      </button>
      {/* 모바일 필터 모달 */}{" "}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {" "}
          <div className="bg-white w-full max-w-md p-4 rounded-lg relative">
            {" "}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="absolute top-2 right-2 text-xl font-bold"
            >
              ×{" "}
            </button>{" "}
            <MobileHallFilter onClose={() => setMobileFilterOpen(false)} />{" "}
          </div>{" "}
        </div>
      )}
      {/* 컨텐츠 부분 */}{" "}
      <div className="w-[1400px] mt-8 max-w-full flex items-start justify-center mx-auto ">
        {/* 좌측 필터 영역 */}{" "}
        <div className="w-[270px] max-h-[calc(100vh-120px)] scrollbar-hidden overflow-y-auto hidden sm:block sticky top-[100px] self-start">
          {" "}
          <div>
            <HallFilter />{" "}
          </div>{" "}
        </div>
        {/* 메인 콘텐츠 영역 */}{" "}
        <div className="w-[750px] flex flex-wrap items-center justify-start ml-2 gap-5">
          {/* ✅ 로딩 상태 조건부 렌더링 */}{" "}
          {isLoading ? (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
              {/* 로딩 스피너 */}
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              {/* 텍스트 */}
              <p className="text-lg text-gray-600">잠시만 기다려주세요...</p>
            </div>
          ) : error ? (
            // 에러 상태
            <div className="w-full h-64 flex items-center justify-center">
              {" "}
              <p className="text-red-500 text-xl">오류 발생: {error}</p>{" "}
            </div>
          ) : (
            // 데이터 로딩 완료 후 (오류 없을 때)
            <>
              {/* 데이터가 없을 때 */}{" "}
              {filteredWeddingHalls.length === 0 && (
                <div className="w-full h-64 flex items-center justify-center">
                  <p>조건에 맞는 웨딩홀이 없습니다.</p>{" "}
                </div>
              )}
              {/* 필터링된 데이터 목록 표시 */}{" "}
              {filteredWeddingHalls.length > 0 &&
                filteredWeddingHalls.map(
                  (
                    company // ✅ HallCard에 CompanyWithOneHallOut 객체 전달
                  ) => <HallCard key={company.id} data={company} />
                )}{" "}
            </>
          )}{" "}
        </div>
        {/* 우측 viewed */}{" "}
        <div className="hidden md:flex">
          <div className="w-[250px] sticky top-0 self-start "></div>
          <div className="flex-1 h-[3000px] "></div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
