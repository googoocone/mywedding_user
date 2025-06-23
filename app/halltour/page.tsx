"use client";

import HallCard from "@/components/pages/halltour/HallCard";
import HallFilter from "@/components/pages/halltour/HallFilter";
import { useState, useEffect, useMemo, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { AiOutlineSearch } from "react-icons/ai";
import { GiSettingsKnobs } from "react-icons/gi";
import { useWeddingFilterStore } from "@/store/useWeddingFilterStore";

import MobileHallFilter from "@/components/pages/halltour/MobileHallFilter";
import AlertDialog from "@/components/common/AlertDialog";

const hotKeywords = ["르비르모어", "아모르하우스", "더채플엣논현", "w웨딩"];

export default function Halltour() {
  let { user, loading: userLoading } = useContext(AuthContext);

  const router = useRouter();

  // Zustand 스토어에서 필터 상태 가져오기
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
  const [halls, setHalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeStatuses, setLikeStatuses] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isLikesLoading, setIsLikesLoading] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      if (!user || !user.phone) {
        setIsLoginModalOpen(true);
      } else {
        setIsLoginModalOpen(false);
      }
    }
  }, [user, userLoading]);

  // 배열을 무작위로 섞는 유틸리티 함수
  const shuffleArray = (array: any[]) => {
    let currentIndex = array.length,
      randomIndex;

    // 남아있는 요소가 없을 때까지 반복
    while (currentIndex !== 0) {
      // 남아있는 요소 중 하나를 무작위로 선택
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // 현재 요소와 무작위로 선택된 요소를 교환
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

  useEffect(() => {
    const fetchWeddingHallsAndLikes = async () => {
      setIsLoading(true);
      setIsLikesLoading(true);

      try {
        // 1. 웨딩홀 목록 가져오기
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
        console.log("Fetched halls data (before shuffle):", hallData);

        // ✅ 획득한 웨딩홀 데이터를 무작위로 섞습니다.
        hallData = shuffleArray(hallData); // 배열을 섞어서 다시 할당

        console.log("Fetched halls data (after shuffle):", hallData);
        setHalls(hallData); // 섞은 데이터로 상태 업데이트

        // 2. 웨딩홀 ID 목록 추출 (섞인 순서의 ID 사용)
        const hallIds = hallData.map((hall: any) => hall.id);

        // 3. 사용자가 로그인했다면, 좋아요 상태 일괄 가져오기
        if (user && hallIds.length > 0) {
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
              setLikeStatuses({});
            }
          } catch (likeErr) {
            console.error("Error fetching batch like status:", likeErr);
            setLikeStatuses({});
          } finally {
            setIsLikesLoading(false);
          }
        } else {
          setLikeStatuses({});
          setIsLikesLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch wedding halls.");
        console.error("Error fetching wedding halls or likes:", err);
        setIsLikesLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeddingHallsAndLikes();
  }, [user, userLoading]);

  // --- 필터링 로직 (useMemo 사용하여 성능 최적화) ---
  const filteredWeddingHalls = useMemo(() => {
    // ... (이전과 동일한 필터링 로직) ...
    if (!halls || halls.length === 0) {
      return [];
    }

    const consolidatedCompanyData: Map<
      string,
      { companyInfo: any; allHalls: any[] }
    > = new Map();

    for (const company of halls) {
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

    if (selectedWeddingType && selectedWeddingType !== "전체") {
      filtered = filtered.filter((company) => {
        return company.halls?.some(
          (hall: any) => hall.type === selectedWeddingType
        );
      });
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

  const handleLoginModalConfirm = () => {
    setIsLoginModalOpen(false);
    if (!user) {
      router.push("/login");
    }

    if (user.phone == false) {
      router.push("/users");
    }
  };

  const handleModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const overallLoading = isLoading || isLikesLoading;

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
      <div className="w-[1400px] mt-8 max-w-full flex items-start justify-center mx-auto ">
        {/* 좌측 필터 영역 */}
        <div className="w-[270px] max-h-[calc(100vh-120px)] scrollbar-hidden overflow-y-auto hidden sm:block sticky top-[100px] self-start">
          <div>
            <HallFilter />
          </div>
        </div>
        {/* 메인 콘텐츠 영역 */}
        <div className="w-[750px] flex flex-wrap items-center justify-start ml-2 gap-5">
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
              {filteredWeddingHalls.length === 0 && (
                <div className="w-full h-64 flex items-center justify-center">
                  <p>조건에 맞는 웨딩홀이 없습니다.</p>
                </div>
              )}
              {filteredWeddingHalls.length > 0 &&
                filteredWeddingHalls.map((company) => (
                  <HallCard
                    key={company.id}
                    data={company}
                    initialIsLiked={likeStatuses[company.id]}
                  />
                ))}
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
        message="3초 만에 로그인하고, 본인 인증을 완료하면 2,000여장의 웨딩홀 할인 견적서를 확인할 수 있어요!"
        confirmText="확인"
      />
    </div>
  );
}
