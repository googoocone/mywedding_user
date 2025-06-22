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
  console.log("Halltour - user:", user); // 디버깅용

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
  // ✅ 추가: 좋아요 상태를 저장할 상태 (key: wedding_company_id, value: boolean)
  const [likeStatuses, setLikeStatuses] = useState<{ [key: number]: boolean }>(
    {}
  );
  // ✅ 추가: 좋아요 상태 로딩 상태
  const [isLikesLoading, setIsLikesLoading] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 로그인 모달 상태만 유지

  // 페이지 진입 시 로그인 상태 확인 및 비로그인 시 로그인 유도 모달
  useEffect(() => {
    if (!userLoading) {
      // 사용자 로딩이 완료된 후에만 실행
      if (!user) {
        setIsLoginModalOpen(true);
      } else {
        setIsLoginModalOpen(false); // 로그인 되어 있으면 모달 닫기
      }
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchWeddingHallsAndLikes = async () => {
      setIsLoading(true);
      setIsLikesLoading(true); // 좋아요 상태 로딩 시작

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

        const hallData: any[] = await hallsResponse.json();
        console.log("Fetched halls data:", hallData);
        setHalls(hallData); // 원본 데이터 그대로 상태에 저장

        // 2. 웨딩홀 ID 목록 추출
        const hallIds = hallData.map((hall: any) => hall.id);

        // 3. 사용자가 로그인했다면, 좋아요 상태 일괄 가져오기
        if (user && hallIds.length > 0) {
          try {
            const likesResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/likes/status/batch`, // ✅ 새로 만든 배치 엔드포인트
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // 세션 쿠키 전송
                body: JSON.stringify({ hall_ids: hallIds }),
              }
            );

            if (likesResponse.ok) {
              const { like_statuses } = await likesResponse.json(); // ✅ 응답 데이터 구조에 맞게 변경
              setLikeStatuses(like_statuses);
            } else {
              console.error(
                "Failed to fetch batch like status:",
                likesResponse.status,
                likesResponse.statusText
              );
              // 에러 발생 시 빈 객체 유지 또는 모든 값을 false로 설정
              setLikeStatuses({});
            }
          } catch (likeErr) {
            console.error("Error fetching batch like status:", likeErr);
            setLikeStatuses({}); // 네트워크 오류 등 발생 시
          } finally {
            setIsLikesLoading(false); // 좋아요 로딩 완료 (오류 포함)
          }
        } else {
          // 사용자가 로그인하지 않았거나 웨딩홀이 없으면 좋아요 로딩 완료
          setLikeStatuses({}); // 로그인하지 않은 경우 모두 false
          setIsLikesLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch wedding halls.");
        console.error("Error fetching wedding halls or likes:", err);
        setIsLikesLoading(false); // 좋아요 로딩도 에러와 함께 종료
      } finally {
        setIsLoading(false); // 전체 로딩 완료 (웨딩홀 데이터)
      }
    };

    fetchWeddingHallsAndLikes();
  }, [user, userLoading]); // user, userLoading이 변경될 때마다 다시 실행 (로그인/로그아웃 시)

  // --- 필터링 로직 (useMemo 사용하여 성능 최적화) ---
  const filteredWeddingHalls = useMemo(() => {
    if (!halls || halls.length === 0) {
      return [];
    }

    // --- 1. 업체명 기준으로 그룹화하고, 각 업체명의 모든 홀들을 모읍니다. ---
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

    // --- 2. 그룹화된 데이터를 필터링된 리스트로 변환합니다. ---
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

    // --- 3. 기존 필터 적용 (업체명 중복이 제거되고 홀 목록이 합쳐진 리스트에 대해) ---

    // 검색어 필터 (업체명 또는 합쳐진 모든 홀 이름 목록 기준)
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

    // 지역 필터 (업체 주소 기준)
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

    // 웨딩 타입 필터 (합쳐진 홀 목록 중 어떤 홀이라도 해당 타입에 일치하는 경우)
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
  ]); // useMemo 의존성 배열

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
  };

  // 로그인 유도 모달 확인/취소 핸들러
  const handleLoginModalConfirm = () => {
    setIsLoginModalOpen(false);
    router.push("/login");
  };

  const handleModalClose = () => {
    setIsLoginModalOpen(false);
  };

  // 전체 로딩 상태 (웨딩홀 데이터 + 좋아요 데이터)
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
          {/* ✅ 로딩 상태 조건부 렌더링 (전체 로딩 상태 사용) */}
          {overallLoading ? (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-lg text-gray-600">잠시만 기다려주세요...</p>
            </div>
          ) : error ? (
            // 에러 상태
            <div className="w-full h-64 flex items-center justify-center">
              <p className="text-red-500 text-xl">오류 발생: {error}</p>
            </div>
          ) : (
            // 데이터 로딩 완료 후 (오류 없을 때)
            <>
              {/* 데이터가 없을 때 */}
              {filteredWeddingHalls.length === 0 && (
                <div className="w-full h-64 flex items-center justify-center">
                  <p>조건에 맞는 웨딩홀이 없습니다.</p>
                </div>
              )}
              {/* 필터링된 데이터 목록 표시 */}
              {filteredWeddingHalls.length > 0 &&
                filteredWeddingHalls.map(
                  (
                    company // ✅ HallCard에 CompanyWithOneHallOut 객체 전달
                  ) => (
                    <HallCard
                      key={company.id}
                      data={company}
                      // ✅ props로 좋아요 상태 전달
                      initialIsLiked={likeStatuses[company.id]}
                    />
                  )
                )}
            </>
          )}
        </div>
        {/* 우측 viewed */}
        <div className="hidden md:flex">
          <div className="w-[250px] sticky top-0 self-start "></div>
          <div className="flex-1 h-[3000px] "></div>
        </div>
      </div>
      <AlertDialog // 로그인 유도 모달
        isOpen={isLoginModalOpen}
        onClose={handleModalClose}
        onConfirm={handleLoginModalConfirm}
        message="3초 만에 로그인하고 웨딩홀 견적서를 확인해보세요!"
        confirmText="로그인하러 가기" // 버튼 텍스트 수정
      />
    </div>
  );
}
