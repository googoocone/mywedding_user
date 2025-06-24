"use client";

import HallCard from "@/components/pages/halltour/HallCard";
import HallFilter from "@/components/pages/halltour/HallFilter";
import { useState, useEffect, useMemo, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { AiOutlineSearch } from "react-icons/ai";
import { GiSettingsKnobs } from "react-icons/gi";
import { useWeddingFilterStore } from "@/store/useWeddingFilterStore";

import MobileHallFilter from "@/components/pages/halltour/MobileHallFilter";
import AlertDialog from "@/components/common/AlertDialog";
import Link from "next/link";

const hotKeywords = [
  { name: "르비르모어", url: "/halltour/르비르모어" },
  { name: "아모르하우스", url: "/halltour/아모르하우스" },
  { name: "더채플엣논현", url: "/halltour/더채플앳논현" },
  { name: "라온제나", url: "/halltour/라온제나%20강남" },
];
const ITEMS_PER_PAGE = 30; // 한 번에 보여줄 아이템 수

export default function Halltour() {
  let { user, loading: userLoading } = useContext(AuthContext);

  const router = useRouter();

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
  const [allHalls, setAllHalls] = useState<any[]>([]); // ✅ 모든 웨딩홀 데이터를 저장할 상태
  const [displayedHalls, setDisplayedHalls] = useState<any[]>([]); // ✅ 현재 화면에 보여질 웨딩홀 데이터
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeStatuses, setLikeStatuses] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isLikesLoading, setIsLikesLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // --- 페이지네이션 관련 상태 추가 ---
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부 (클라이언트 측)

  // 배열을 무작위로 섞는 유틸리티 함수
  const shuffleArray = (array: any[]) => {
    let currentIndex = array.length,
      randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

  // ✅ 모든 웨딩홀 데이터와 좋아요 상태를 한 번에 불러오는 초기 로딩 로직
  useEffect(() => {
    const fetchAllWeddingHallsAndLikes = async () => {
      setIsLoading(true);
      setError(null); // 에러 초기화

      try {
        const hallsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/hall/get_wedding_halls`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!hallsResponse.ok) {
          const errorBody = await hallsResponse.json();
          throw new Error(
            `Failed to fetch halls: ${hallsResponse.status} ${
              hallsResponse.statusText
            } - ${errorBody.detail || ""}`
          );
        }

        let hallData: any[] = await hallsResponse.json();
        console.log("Fetched all halls data:", hallData);

        // ✅ 획득한 웨딩홀 데이터를 무작위로 섞습니다.
        hallData = shuffleArray(hallData);
        setAllHalls(hallData); // 모든 데이터 저장

        // 2. 웨딩홀 ID 목록 추출
        const hallIds = hallData.map((hall: any) => hall.id);

        // 3. 사용자가 로그인했다면, 좋아요 상태 일괄 가져오기
        if (user && hallIds.length > 0) {
          setIsLikesLoading(true);
          try {
            const likesResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/likes/status/batch`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ hall_ids: hallIds }),
              }
            );

            if (likesResponse.ok) {
              const { like_statuses } = await likesResponse.json();
              setLikeStatuses(like_statuses);
            } else {
              console.error(
                "Failed to fetch batch like status:",
                likesResponse.status,
                likesResponse.statusText
              );
            }
          } catch (likeErr) {
            console.error("Error fetching batch like status:", likeErr);
          } finally {
            setIsLikesLoading(false);
          }
        } else {
          setLikeStatuses({}); // 로그인하지 않았거나 데이터 없으면 좋아요 상태 초기화
          setIsLikesLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch wedding halls.");
        console.error("Error fetching all wedding halls or likes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllWeddingHallsAndLikes();
  }, [user, userLoading]); // 컴포넌트 마운트 시 한 번만 또는 user/userLoading 변경 시 실행

  // --- 필터링 로직 (useMemo 사용하여 성능 최적화) ---
  const filteredWeddingHalls = useMemo(() => {
    if (!allHalls || allHalls.length === 0) {
      return [];
    }

    const consolidatedCompanyData: Map<
      string,
      { companyInfo: any; allHalls: any[] }
    > = new Map();

    // 회사별로 홀들을 통합
    for (const company of allHalls) {
      // ✅ allHalls에서 필터링 시작
      if (company.name) {
        if (!consolidatedCompanyData.has(company.name)) {
          consolidatedCompanyData.set(company.name, {
            companyInfo: company,
            allHalls: [],
          });
        }
        if (company.halls && company.halls.length > 0) {
          const existingData = consolidatedCompanyData.get(company.name)!;
          existingData.allHalls.push(...company.halls);
        }
      }
    }

    let filtered: any[] = [];
    for (const data of consolidatedCompanyData.values()) {
      const representativeCompany = data.companyInfo;
      const allHallsForCompany = data.allHalls;

      const entry = {
        ...representativeCompany,
        halls: allHallsForCompany,
      };

      if (entry.halls && entry.halls.length > 0) {
        filtered.push(entry);
      }
    }

    // 검색어 필터링
    if (appliedSearchTerm.trim() !== "") {
      const lowerSearchTerm = appliedSearchTerm
        .toLowerCase()
        .replace(/\s+/g, "");

      filtered = filtered.filter((company) => {
        const companyNameMatch = company.name
          ?.toLowerCase()
          .replace(/\s+/g, "")
          .includes(lowerSearchTerm);

        const anyHallNameMatch = company.halls?.some((hall: any) =>
          hall.name?.toLowerCase().replace(/\s+/g, "").includes(lowerSearchTerm)
        );

        return companyNameMatch || anyHallNameMatch;
      });
    }

    // 지역 필터링
    if (selectedRegion && selectedRegion !== "전체") {
      filtered = filtered.filter((company) => {
        const address = company.address || "";
        const regionMatch = address.includes(selectedRegion);

        if (regionMatch && selectedSubRegion && selectedSubRegion !== "전체") {
          return address.includes(selectedSubRegion);
        }

        return regionMatch;
      });
    }

    // 웨딩 타입 필터링
    if (selectedWeddingType && selectedWeddingType !== "전체") {
      filtered = filtered.filter((company) => {
        return company.halls?.some(
          (hall: any) => hall.type === selectedWeddingType
        );
      });
    }
    // selectedFlower 필터링은 현재 로직에 없으므로, 필요하다면 추가
    // if (selectedFlower && selectedFlower !== "전체") { /* ... */ }

    return filtered;
  }, [
    allHalls, // ✅ allHalls가 변경될 때마다 재계산
    appliedSearchTerm,
    selectedRegion,
    selectedSubRegion,
    selectedWeddingType,
    selectedFlower,
  ]);

  // ✅ 필터링된 데이터가 변경되거나 페이지가 변경될 때 displayedHalls 업데이트
  useEffect(() => {
    // 필터링 결과가 변경되면 페이지를 1로 리셋하고 새롭게 보여줄 데이터 설정
    setCurrentPage(1);
    setDisplayedHalls(filteredWeddingHalls.slice(0, ITEMS_PER_PAGE));
    setHasMore(filteredWeddingHalls.length > ITEMS_PER_PAGE);
  }, [filteredWeddingHalls]); // filteredWeddingHalls가 변경될 때마다 실행

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
  };

  // ✅ "더 보기" 버튼 클릭 핸들러
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const nextHalls = filteredWeddingHalls.slice(startIndex, endIndex);

    setDisplayedHalls((prevHalls) => [...prevHalls, ...nextHalls]);
    setCurrentPage(nextPage);

    // 더 이상 보여줄 데이터가 없으면 hasMore를 false로 설정
    setHasMore(endIndex < filteredWeddingHalls.length);
  };

  const handleLoginModalConfirm = () => {
    setIsLoginModalOpen(false);
    if (!user) {
      router.push("/login");
    }
  };

  const handleModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const overallLoading = isLoading; // 초기 로딩 상태

  return (
    <div className=" w-full ">
      <button
        onClick={() => setMobileFilterOpen(true)}
        className="sm:hidden fixed bottom-0 left-0 w-full z-40 px-4 py-3 bg-white border-y border-gray-200 flex items-center justify-center gap-2"
      >
        <GiSettingsKnobs /> 필터
      </button>
      {/* 검색창 부분 */}
      <div className="w-full h-[180px] sm:w-[1400px] max-w-full px-4 sm:px-[80px] mx-auto flex flex-col items-center justify-center bg-white">
        <div className="w-full sm:w-[500px] h-[50px] border border-gray-300 rounded-full flex items-center">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="flex-1 h-full rounded-full focus:outline-none pl-4 text-sm"
            placeholder="검색을 시작해 보세요"
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
            <Link href={item.url}>
              <div
                key={index}
                className="text-[10px] xs:text-[12px] sm:text-[14px] text-gray-500 hover:text-gray-700 px-1"
              >
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

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
      <div className="w-[1400px]  max-w-full flex items-start justify-center mx-auto ">
        {/* 좌측 필터 영역 */}
        <div className="w-[270px] max-h-[calc(100vh-120px)] scrollbar-hidden overflow-y-auto hidden sm:block sticky top-[100px] self-start">
          <div>
            <HallFilter />
          </div>
        </div>
        {/* 메인 콘텐츠 영역 */}
        <div className="w-[850px] flex flex-wrap items-center justify-start ml-2 gap-5">
          {overallLoading ? (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-lg text-gray-600">잠시만 기다려주세요...</p>
            </div>
          ) : error ? (
            <div className="w-full h-64 flex items-center justify-center">
              <p className="text-red-500 text-xl">오류 발생: {error}</p>
            </div>
          ) : (
            <>
              {displayedHalls.length === 0 && ( // 보여줄 데이터가 없을 때
                <div className="w-full h-64 flex items-center justify-center">
                  <p>조건에 맞는 웨딩홀이 없습니다.</p>
                </div>
              )}
              {displayedHalls.length > 0 &&
                displayedHalls.map(
                  (
                    company // ✅ displayedHalls 사용
                  ) => (
                    <HallCard
                      key={company.id}
                      data={company}
                      initialIsLiked={likeStatuses[company.id]}
                    />
                  )
                )}
              {hasMore && ( // 더 불러올 데이터가 있을 때만 "더 보기" 버튼 표시
                <div className="w-full flex justify-center mt-4">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-[#ff767b]/80 text-white rounded-full hover:bg-[#ff767b] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    더 보기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* 우측 viewed */}
        <div className="hidden md:flex">
          <div className="sm:w-[250px] sticky top-0 self-start "></div>
          <div className="flex-1 h-[3000px] "></div>
        </div>
      </div>
      <AlertDialog
        isOpen={isLoginModalOpen}
        onClose={handleModalClose}
        onConfirm={handleLoginModalConfirm}
        message="3초 만에 로그인하고 2,000여장의 웨딩홀 할인 견적서를 확인하기"
        confirmText="확인"
      />
    </div>
  );
}
