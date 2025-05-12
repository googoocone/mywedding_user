"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import PhotoSection from "@/components/pages/halltour/halldetail/PhotoSection";
import ImageModal from "@/components/pages/halltour/halldetail/ImageModal";
import Calculator from "@/components/pages/halltour/halldetail/Calculator";
import HeaderSection from "@/components/pages/halltour/halldetail/HeaderSection";
import BasicInfoSection from "@/components/pages/halltour/halldetail/BasicInfoSection";
import IncludedSection from "@/components/pages/halltour/halldetail/IncludedSection";
import OptionSection from "@/components/pages/halltour/halldetail/OptionSection";
import HallInfoSection from "@/components/pages/halltour/halldetail/HallInfoSection";
import EtcSection from "@/components/pages/halltour/halldetail/EtcSection";

// --- 타입 정의 ---
interface MealPrice {
  id: number;
  estimate_id: number;
  meal_type: string;
  category: string;
  price: number;
  extra?: string;
}
interface EstimateOption {
  id: number;
  name: string;
  price: number;
  is_required: boolean;
}
interface Estimate {
  id: number;
  hall_id: number;
  hall_price: number;
  date: string;
  time: string;
  type: "standard" | "admin";
  meal_prices: MealPrice[];
  estimate_options: EstimateOption[];
  penalty_amount?: number;
  penalty_detail?: string;
  etcs?: { content: string }[];
}
interface Hall {
  id: number;
  name: string;
  mood?: string;
  type?: string;
  guarantees?: number;
  interval_minutes?: number;
  parking?: number;
  hall_photos?: any[];
  hall_includes?: any[];
  estimates: Estimate[];
}
interface HallCompany {
  id: number;
  phone: string;
  accessibility: string;
  lng: number;
  address: string;
  name: string;
  homepage: string;
  lat: number;
  ceremony_times: string;
  halls: Hall[];
}

export default function HallDetailPage() {
  const params = useParams();
  const companyNameParam = params.companyName;
  const companyName = Array.isArray(companyNameParam)
    ? companyNameParam[0]
    : companyNameParam;

  // --- 상태 변수 ---
  const [hallNameFilter, setHallNameFilter] = useState<string>("");
  const [estimateTypeFilter, setEstimateTypeFilter] = useState<string>(""); // 초기값은 아래 useEffect에서 설정
  const [dateFilter, setDateFilter] = useState<string>(""); // 초기값은 아래 useEffect에서 설정
  const [hallCompany, setHallCompany] = useState<HallCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // --- 데이터 로딩 ---
  useEffect(() => {
    if (!companyName) {
      setError("업체 이름을 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }
    const fetchDetailWeddingHall = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // encodeURIComponent 제거된 URL
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/hall/get_detail_wedding_hall/${companyName}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!response.ok) {
          const err = await response.json();
          throw new Error(
            `${response.status} ${response.statusText} - ${
              err.detail || "데이터 로딩 실패"
            }`
          );
        }
        const raw: any[] = await response.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const base = raw[0];
          const {
            id,
            phone,
            accessibility,
            lng,
            address,
            name,
            homepage,
            lat,
            ceremony_times,
          } = base;
          const mergedHalls: Hall[] = raw
            .map((item) => item.halls?.[0])
            .filter(Boolean);
          setHallCompany({
            id,
            phone,
            accessibility,
            lng,
            address,
            name,
            homepage,
            lat,
            ceremony_times,
            halls: mergedHalls,
          });
        } else {
          setHallCompany(null);
          setError("해당 업체의 웨딩홀 정보를 찾을 수 없습니다.");
        }
      } catch (err: any) {
        setError(err.message);
        setHallCompany(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetailWeddingHall();
  }, [companyName]);

  // --- 파생 상태 및 필터 로직 ---
  const allHalls: Hall[] = hallCompany?.halls || [];

  // 1. 홀 이름 목록 및 기본 홀 이름 설정
  const hallNames = useMemo(
    () => Array.from(new Set(allHalls.map((h) => h.name))),
    [allHalls]
  );
  useEffect(() => {
    if (!isLoading && allHalls.length > 0 && !hallNameFilter) {
      // 최초 로딩 시 또는 hallNameFilter가 비었을 때
      setHallNameFilter(allHalls[0].name);
    }
  }, [isLoading, allHalls, hallNameFilter]);

  // 2. 현재 선택된 홀 객체
  const currentHall = useMemo(() => {
    return allHalls.find((h) => h.name === hallNameFilter);
  }, [allHalls, hallNameFilter]);

  // 3. 현재 홀의 예약 가능 날짜 목록 (모든 날짜)
  const datesForHall = useMemo(() => {
    if (!currentHall) return [];
    return Array.from(new Set(currentHall.estimates.map((e) => e.date))).sort();
  }, [currentHall]);

  // 4. 홀 변경 시 또는 날짜 목록 변경 시 -> 날짜 필터 기본값 설정
  useEffect(() => {
    if (currentHall) {
      // 홀이 선택되었을 때만
      if (datesForHall.length > 0) {
        // 현재 dateFilter가 유효한 날짜 목록에 없거나, 설정되지 않았다면
        if (!dateFilter || !datesForHall.includes(dateFilter)) {
          // admin 견적이 있는 날짜를 우선으로 찾아 설정
          const adminDate = datesForHall.find((d) =>
            currentHall.estimates.some(
              (e) => e.date === d && e.type === "admin"
            )
          );
          setDateFilter(adminDate || datesForHall[0]); // admin 날짜 없으면 첫 번째 날짜로
        }
      } else {
        setDateFilter(""); // 선택 가능한 날짜가 없으면 빈 값
      }
    }
  }, [currentHall, datesForHall]); // currentHall 또는 datesForHall 변경시 실행

  // 5. 현재 홀 & 선택된 날짜에 따른 견적서 종류 버튼 목록 (standard 우선)
  const estimateTypesForDateButtons: string[] = useMemo(() => {
    if (!currentHall) return []; // 홀 없으면 빈 배열
    const types: Set<string> = new Set();
    // 홀에 standard 견적서가 있는지 확인 (날짜 무관)
    if (currentHall.estimates.some((e) => e.type === "standard")) {
      types.add("standard");
    }
    // 선택된 날짜에 admin 견적서가 있는지 확인
    if (
      dateFilter &&
      currentHall.estimates.some(
        (e) => e.date === dateFilter && e.type === "admin"
      )
    ) {
      types.add("admin");
    }
    // standard가 먼저 오도록 정렬
    return Array.from(types).sort((a, b) => {
      if (a === "standard") return -1;
      if (b === "standard") return 1;
      return 0; // 나머지는 순서 유지 (admin만 남음)
    });
  }, [currentHall, dateFilter]);

  // 6. 견적서 종류 버튼 목록 변경 시 -> 견적서 종류 필터 기본값 설정
  useEffect(() => {
    if (currentHall) {
      // 현재 선택된 홀이 있을 때만 로직 실행
      if (estimateTypesForDateButtons.length > 0) {
        // 현재 설정된 estimateTypeFilter가 여전히 유효한 선택지인지 확인
        const isCurrentTypeValid =
          estimateTypesForDateButtons.includes(estimateTypeFilter);

        // 현재 타입이 유효하지 않거나, 아직 타입이 설정되지 않았다면 기본값으로 설정
        if (!estimateTypeFilter || !isCurrentTypeValid) {
          if (estimateTypesForDateButtons.includes("admin")) {
            setEstimateTypeFilter("admin"); // admin이 가능하면 admin을 기본으로
          } else if (estimateTypesForDateButtons.includes("standard")) {
            setEstimateTypeFilter("standard"); // admin 없고 standard만 있으면 standard를 기본으로
          } else {
            // 이 경우는 거의 없겠지만, 목록에 다른 타입만 있다면 첫 번째 것으로 설정
            setEstimateTypeFilter(estimateTypesForDateButtons[0]);
          }
        }
        // 이미 유효한 타입이 설정되어 있다면 (사용자가 직전에 클릭한 경우 등), 그 선택을 유지한다.
        // (별도의 setEstimateTypeFilter 호출 없음)
      } else {
        // 선택 가능한 견적서 타입이 아예 없으면 estimateTypeFilter를 비운다.
        setEstimateTypeFilter("");
      }
    }
    // 이 useEffect는 currentHall이 바뀌거나, dateFilter가 바뀌어서
    // 결과적으로 estimateTypesForDateButtons 목록이 변경되었을 때 실행되어야 한다.
    // estimateTypeFilter 자체의 변경으로 이 useEffect가 다시 실행되어 사용자 선택을 덮어쓰는 것을 방지하기 위해
    // 의존성 배열에서 estimateTypeFilter를 제거한다.
  }, [currentHall, dateFilter, estimateTypesForDateButtons]); // 의존성 배열 수정

  // 7. [핵심] 최종적으로 Calculator와 페이지에 전달할 견적서 결정
  const { standardEstimate, adminEstimate, displayEstimate } = useMemo(() => {
    if (!currentHall) {
      return {
        standardEstimate: null,
        adminEstimate: null,
        displayEstimate: null,
      };
    }
    const stdEst: Estimate | null =
      currentHall.estimates.find((e) => e.type === "standard") || null;
    let admEst: Estimate | null = null;
    if (dateFilter) {
      admEst =
        currentHall.estimates.find(
          (e) => e.date === dateFilter && e.type === "admin"
        ) || null;
    }
    let dispEst: Estimate | null = null;
    if (estimateTypeFilter === "admin" && admEst) {
      dispEst = admEst;
    } else {
      dispEst = stdEst;
    }
    return {
      standardEstimate: stdEst,
      adminEstimate: admEst,
      displayEstimate: dispEst,
    };
  }, [currentHall, dateFilter, estimateTypeFilter]);

  // --- 이벤트 핸들러 ---
  const handleShowAllPhotos = () => setShowImageModal(true);
  const handleCloseModal = () => setShowImageModal(false);

  // --- 로딩 / 에러 / 데이터 없음 처리 ---
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        로딩 중...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-red-600">
        오류 발생: {error}
      </div>
    );
  if (!hallCompany)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-gray-500">
        웨딩홀 정보를 찾을 수 없습니다.
      </div>
    );

  // --- 렌더링 ---
  return (
    <div className="w-full relative flex flex-col items-center justify-center">
      {/* Photo Section */}
      <div className="w-full sm:w-[1250px] flex flex-col items-center justify-start">
        <PhotoSection
          data={currentHall?.hall_photos || []}
          onShowAllPhotos={handleShowAllPhotos}
        />
      </div>

      {/* Details */}
      <div className="w-full sm:w-[1250px] flex flex-col lg:flex-row items-start justify-between">
        {/* 왼쪽 컨텐츠 */}
        <div className="w-full lg:w-[750px] flex flex-col items-center mb-8 lg:mb-0">
          <HeaderSection
            name={hallCompany.name}
            address={hallCompany.address}
          />
          <div className="w-full border-b border-gray-400 my-4"></div>
          {displayEstimate ? (
            <>
              <BasicInfoSection
                name={currentHall?.name || ""}
                mood={currentHall?.mood || ""}
                time={hallCompany.ceremony_times || ""}
                hall_type={currentHall?.type || ""}
                meal_type={displayEstimate.meal_prices?.[0]?.meal_type || ""}
                guarantee={currentHall?.guarantees || 0}
                interval_minutes={currentHall?.interval_minutes || 0}
                parking={currentHall?.parking || 0}
                price={displayEstimate.hall_price}
                meal_price={displayEstimate.meal_prices || []}
              />
              <IncludedSection
                hall_includes={currentHall?.hall_includes || []}
              />
              <OptionSection
                hall_options={displayEstimate.estimate_options || []}
              />
              <EtcSection
                penalty_amount={displayEstimate.penalty_amount}
                penalty_detail={displayEstimate.penalty_detail}
                etc={displayEstimate.etcs?.[0]?.content || "정보 없음"}
              />
              <HallInfoSection
                address={hallCompany.address}
                phone={hallCompany.phone}
                homepage={hallCompany.homepage}
                accessibility={hallCompany.accessibility}
                lat={hallCompany.lat}
                lng={hallCompany.lng}
              />
            </>
          ) : (
            <div className="mt-8 text-center text-gray-500">
              선택하신 조건에 맞는 상세 견적 정보가 없습니다.
            </div>
          )}
        </div>

        {/* 오른쪽 필터 & 계산기 */}
        <div className="w-full lg:w-[400px]  mt-10 lg:mt-10">
          {/* 필터 */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-lg space-y-2 mb-4">
            {/* 홀 이름 필터 */}
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-700">홀 이름</span>
              <div className="flex flex-wrap gap-2 my-2">
                {hallNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setHallNameFilter(name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                      hallNameFilter === name
                        ? "bg-[#ffe4de] text-[#ff767b]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            {/* 견적서 종류 필터 (버튼 목록: estimateTypesForDateButtons, 활성 버튼: estimateTypeFilter 기준) */}
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-700">
                견적서 종류
              </span>
              <div className="flex flex-wrap gap-2 my-2">
                {estimateTypesForDateButtons.map((type: string) => (
                  <button
                    key={type}
                    onClick={() => setEstimateTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                      estimateTypeFilter === type
                        ? "bg-[#ffe4de] text-[#ff767b]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type === "standard"
                      ? "일반 견적서"
                      : type === "admin"
                      ? "할인 견적서"
                      : type}
                  </button>
                ))}
                {estimateTypesForDateButtons.length === 0 && (
                  <span className="text-xs text-gray-400">
                    견적서 정보 없음
                  </span>
                )}
              </div>
            </div>
            {/* 날짜 필터 */}
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-700">
                날짜 선택
              </span>
              <div className="flex flex-wrap gap-2 my-2">
                {datesForHall.map((date: string) => {
                  const parsedDate = new Date(date);
                  const year = parsedDate.getFullYear();
                  const month = parsedDate.getMonth() + 1;
                  const weekday = parsedDate.toLocaleDateString("ko-KR", {
                    weekday: "short",
                  });
                  return (
                    <button
                      key={date}
                      onClick={() => setDateFilter(date)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                        dateFilter === date
                          ? "bg-[#ffe4de] text-[#ff767b]"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {" "}
                      {`${year}.${
                        month < 10 ? "0" + month : month
                      } (${weekday})`}{" "}
                    </button>
                  );
                })}
                {datesForHall.length === 0 && currentHall && (
                  <span className="text-xs text-gray-400">
                    예약 가능 날짜 정보 없음
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* 계산기 */}
          <Calculator
            standardEstimate={standardEstimate}
            adminEstimate={adminEstimate}
            selectedType={estimateTypeFilter as "standard" | "admin"} // 타입 단언
          />
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          photos={currentHall?.hall_photos || []}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
