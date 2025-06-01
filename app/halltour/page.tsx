// Halltour.tsx

"use client";

import HallCard from "@/components/pages/halltour/HallCard";
import HallFilter from "@/components/pages/halltour/HallFilter";
import HallSwiper from "@/components/pages/halltour/HallSwiper";
// import HallViewed from "@/components/pages/halltour/HallViewed"; // 사용되지 않는 것 같으면 삭제 고려
// import { weddingHallList } from "@/constants"; // 필요없으면 삭제 고려
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
  let { user } = useContext(AuthContext);
  console.log("user", user);
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

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false); // 모바일 필터 모달 상태 // 백엔드에서 불러온 원본 데이터를 저장하는 상태 // 백엔드 응답 구조는 WeddingCompany 객체들의 리스트 형태입니다. // 정확한 타입 정의가 있다면 WeddingCompany[]와 같이 사용하세요.

  const [halls, setHalls] = useState<any[]>([]); // any[] 또는 WeddingCompany[] 타입 사용

  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태 // 백엔드에서 데이터 가져오는 useEffect 훅

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchWeddingHalls = async () => {
      setIsLoading(true); // 데이터 페칭 시작 시 로딩 상태 활성화
      try {
        // 백엔드 API 엔드포인트 URL
        // 백엔드는 모든 업체와 그에 딸린 모든 홀, 사진, 견적 등을 포함한 리스트를 반환한다고 가정합니다.
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
        } // ✅ 백엔드에서 가져온 데이터는 업체 객체들의 리스트입니다. // 각 업체 객체는 모든 홀과 관련 정보를 halls 리스트 형태로 가집니다.

        const data: any[] = await response.json(); // 데이터 구조는 제공해주신 JSON 예시와 같습니다.
        console.log("data", data);
        setHalls(data); // 원본 데이터 그대로 상태에 저장
      } catch (err: any) {
        setError(err.message || "Failed to fetch wedding halls.");
        console.error("Error fetching wedding halls:", err);
      } finally {
        setIsLoading(false); // 로딩 완료 또는 에러 발생 시 로딩 상태 해제
      }
    };

    fetchWeddingHalls();
  }, []); // 빈 배열: 컴포넌트가 처음 마운트될 때만 실행 // --- 필터링 로직 (useMemo 사용하여 성능 최적화) --- // 백엔드에서 가져온 원본 데이터를 가지고 필터링 및 데이터 재구성을 수행합니다.

  const filteredWeddingHalls = useMemo(() => {
    // 입력: halls는 백엔드에서 가져온 모든 WeddingCompany 객체들의 리스트입니다.
    //       각 Company 객체는 halls 속성에 해당 업체의 모든 Hall 객체 리스트를 가집니다.
    // 출력: 업체명 기준으로 중복이 제거되고 다른 필터가 적용된 Company 객체 리스트.
    //       각 Company 객체의 'halls' 속성은 해당 업체명의 모든 홀들을 합친 목록입니다.

    if (!halls || halls.length === 0) {
      return []; // 데이터가 없으면 빈 배열 반환
    }

    // --- 1. 업체명 기준으로 그룹화하고, 각 업체명의 모든 홀들을 모읍니다. ---
    const consolidatedCompanyData: Map<
      string,
      { representativeCompany: any; allHalls: any[] }
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
      // ✅ 검색어에서 띄어쓰기를 제거하고 소문자로 변환합니다.
      const lowerSearchTerm = appliedSearchTerm
        .toLowerCase()
        .replace(/\s+/g, "");

      filtered = filtered.filter((company) => {
        // ✅ 업체명에서 띄어쓰기를 제거하고 소문자로 변환하여 비교합니다.
        const companyNameMatch = company.name
          ?.toLowerCase()
          .replace(/\s+/g, "") // 띄어쓰기 제거
          .includes(lowerSearchTerm);

        // ✅ 홀 이름에서 띄어쓰기를 제거하고 소문자로 변환하여 비교합니다.
        const anyHallNameMatch = company.halls?.some((hall: any) =>
          hall.name
            ?.toLowerCase()
            .replace(/\s+/g, "") // 띄어쓰기 제거
            .includes(lowerSearchTerm)
        );

        return companyNameMatch || anyHallNameMatch; // 업체명 또는 어떤 홀 이름이라도 일치 시 포함
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

    // 꽃 장식 필터 (주석 처리된 상태 유지)
    // if (selectedFlower && selectedFlower !== "전체") {
    //   filtered = filtered.filter((company) => {
    //     return company.halls?.some((hall: any) => hall.mood === selectedFlower);
    //   });
    // }

    return filtered; // 최종 필터링된 리스트 반환
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

  // 모달 렌더링 로직 //
  // 공통 모달 렌더링==
  useEffect(() => {
    async function fetchInfo() {
      console.log("user.phone", user.phone);
      if (user?.phone === false) {
        // user.phone이 false (인증되지 않음)일 때

        setIsModalOpen(true); // 모달을 띄웁니다.
      }
    }
    if (user !== undefined) {
      fetchInfo();
    }
  }, [user]); // user 객체가 변경될 때마다 이펙트 실행

  // ➍ 모달 확인 버튼 클릭 핸들러
  const handleModalConfirm = () => {
    setIsModalOpen(false); // 모달 닫기
    router.push("/users"); // /users 페이지로 이동
  };

  // ➎ 모달 취소 버튼 클릭 핸들러 (모달만 닫고 페이지는 이동하지 않음)
  const handleModalClose = () => {
    setIsModalOpen(false); // 모달 닫기
    // 사용자가 '취소'를 눌렀을 때 특정 동작을 원한다면 여기에 추가
    // 예를 들어, 다른 페이지로 이동시키거나, 모달을 계속 표시하는 등의 선택
  };

  return (
    <div className="mt-[80px] w-full ">
      {/* 검색창 부분 */} {/* ... (검색창 JSX) ... */}
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
      {/* <HallSwiper />  */}
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
          {/* ✅ 로딩 상태 조건부 렌더링 */}
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
                  ) => <HallCard key={company.id} data={company} />
                )}
            </>
          )}
          <div
            onClick={() => router.push("/halltour/map")}
            className="fixed bottom-14 left-1/2 transform -translate-x-1/2 shadow-lg px-5 py-2.5 bg-black/90 text-white rounded-full z-50 cursor-pointer hover:bg-black transition-colors"
            // onClick 이벤트 핸들러를 여기에 추가하여 지도 보기 기능을 구현할 수 있습니다.
            // 예: onClick={() => console.log("지도 보기 클릭됨")}
          >
            지도로보기
          </div>
        </div>
        {/* 우측 viewed */}
        <div className="hidden md:flex">
          <div className="w-[250px] sticky top-0 self-start "></div>
          <div className="flex-1 h-[3000px] "></div>
        </div>
      </div>
      <AlertDialog // ➏ AlertDialog 컴포넌트 추가
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        message="휴대폰 번호 인증을 하시면 모든 할인 견적서를 보실 수 있어요!"
        confirmText="인증하러 가기"
      />
    </div>
  );
}
