"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import PhotoSection from "@/components/pages/halltour/halldetail/PhotoSection";
import ImageModal from "@/components/pages/halltour/halldetail/ImageModal";
import Calculator from "@/components/pages/halltour/halldetail/Calculator"; // Calculator.tsx의 경로는 실제 프로젝트에 맞게 조정해주세요.
import HeaderSection from "@/components/pages/halltour/halldetail/HeaderSection";
import BasicInfoSection from "@/components/pages/halltour/halldetail/BasicInfoSection";
import IncludedSection from "@/components/pages/halltour/halldetail/IncludedSection";
import OptionSection from "@/components/pages/halltour/halldetail/OptionSection";
import HallInfoSection from "@/components/pages/halltour/halldetail/HallInfoSection";
import EtcSection from "@/components/pages/halltour/halldetail/EtcSection";
import { CiCalculator1, CiFilter } from "react-icons/ci"; // 아이콘 추가 (CiFilter는 예시, 적절한 필터 아이콘 사용)
import { IoClose } from "react-icons/io5"; // 닫기 아이콘

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
  const [estimateTypeFilter, setEstimateTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [hallCompany, setHallCompany] = useState<HallCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // 모바일 하단 패널 표시를 위한 상태 변수
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

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

  const hallNames = useMemo(
    () => Array.from(new Set(allHalls.map((h) => h.name))),
    [allHalls]
  );

  useEffect(() => {
    if (!isLoading && allHalls.length > 0 && !hallNameFilter) {
      setHallNameFilter(allHalls[0].name);
    }
  }, [isLoading, allHalls, hallNameFilter]);

  const currentHall = useMemo(() => {
    return allHalls.find((h) => h.name === hallNameFilter);
  }, [allHalls, hallNameFilter]);
  console.log("current hall photos", currentHall?.hall_photos);
  const datesForHall = useMemo(() => {
    if (!currentHall) return [];
    return Array.from(new Set(currentHall.estimates.map((e) => e.date))).sort();
  }, [currentHall]);

  useEffect(() => {
    if (currentHall) {
      if (datesForHall.length > 0) {
        if (!dateFilter || !datesForHall.includes(dateFilter)) {
          const adminDate = datesForHall.find((d) =>
            currentHall.estimates.some(
              (e) => e.date === d && e.type === "admin"
            )
          );
          setDateFilter(adminDate || datesForHall[0]);
        }
      } else {
        setDateFilter("");
      }
    }
  }, [currentHall, datesForHall, dateFilter]);

  const estimateTypesForDateButtons: string[] = useMemo(() => {
    if (!currentHall) return [];
    const types: Set<string> = new Set();
    if (currentHall.estimates.some((e) => e.type === "standard")) {
      types.add("standard");
    }
    if (
      dateFilter &&
      currentHall.estimates.some(
        (e) => e.date === dateFilter && e.type === "admin"
      )
    ) {
      types.add("admin");
    }
    return Array.from(types).sort((a, b) => {
      if (a === "standard") return -1;
      if (b === "standard") return 1;
      return 0;
    });
  }, [currentHall, dateFilter]);

  useEffect(() => {
    if (currentHall) {
      if (estimateTypesForDateButtons.length > 0) {
        const isCurrentTypeValid =
          estimateTypesForDateButtons.includes(estimateTypeFilter);
        if (!estimateTypeFilter || !isCurrentTypeValid) {
          if (estimateTypesForDateButtons.includes("admin")) {
            setEstimateTypeFilter("admin");
          } else if (estimateTypesForDateButtons.includes("standard")) {
            setEstimateTypeFilter("standard");
          } else {
            setEstimateTypeFilter(estimateTypesForDateButtons[0]);
          }
        }
      } else {
        setEstimateTypeFilter("");
      }
    }
  }, [
    currentHall,
    dateFilter,
    estimateTypesForDateButtons,
    estimateTypeFilter,
  ]);

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

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
    setIsCalculatorModalOpen(false); // 다른 모달은 닫기
  };

  const openCalculatorModal = () => {
    setIsCalculatorModalOpen(true);
    setIsFilterModalOpen(false); // 다른 모달은 닫기
  };

  const closeModal = () => {
    setIsFilterModalOpen(false);
    setIsCalculatorModalOpen(false);
  };

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
    <div className="w-full relative flex flex-col items-center justify-center pb-20 lg:pb-0">
      {" "}
      {/* 모바일 하단 버튼 공간 확보 */}
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
        <div className="w-full lg:w-[750px] flex flex-col items-center mb-8 lg:mb-0 px-4 sm:px-0">
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

        {/* 오른쪽 필터 & 계산기 (데스크톱용) */}
        <div className="w-full lg:w-[400px] mt-10 lg:mt-10 hidden lg:block">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-lg space-y-2 mb-4 sticky top-4">
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
            {/* 견적서 종류 필터 */}
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
                      {`${year}.${
                        month < 10 ? "0" + month : month
                      } (${weekday})`}
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
          <div className="sticky top-[calc(4rem+180px)]">
            {" "}
            {/* 값은 실제 필터 높이에 따라 조정 */}
            <Calculator
              standardEstimate={standardEstimate}
              adminEstimate={adminEstimate}
              selectedType={estimateTypeFilter as "standard" | "admin"}
            />
          </div>
        </div>
      </div>
      {/* --- 모바일 하단 고정 버튼 --- */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 flex z-50">
        <button
          onClick={openFilterModal}
          className={`flex-1 flex flex-col items-center justify-center text-xs font-medium transition-colors ${
            isFilterModalOpen
              ? "text-[#ff767b]"
              : "text-gray-700 hover:text-[#ff767b]"
          }`}
        >
          <CiFilter
            className={`w-6 h-6 mb-0.5 ${
              isFilterModalOpen ? "text-[#ff767b]" : "text-gray-500"
            }`}
          />
          필터
        </button>
        <div className="w-px h-full bg-gray-200"></div> {/* 구분선 */}
        <button
          onClick={openCalculatorModal}
          className={`flex-1 flex flex-col items-center justify-center text-xs font-medium transition-colors ${
            isCalculatorModalOpen
              ? "text-[#ff767b]"
              : "text-gray-700 hover:text-[#ff767b]"
          }`}
        >
          <CiCalculator1
            className={`w-6 h-6 mb-0.5 ${
              isCalculatorModalOpen ? "text-[#ff767b]" : "text-gray-500"
            }`}
          />
          견적 계산기
        </button>
      </div>
      {/* --- 모바일 필터 모달 (하단 시트 형태) --- */}
      {isFilterModalOpen && (
        // 배경 클릭 시 닫기
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-[110] flex items-end transition-opacity duration-300 ease-out"
          onClick={closeModal} // 배경 클릭 시 모든 모달 닫기
        >
          {/* 실제 모달 컨텐츠 (이벤트 버블링 방지) */}
          <div
            className="w-full bg-white rounded-t-2xl p-4 pt-5 shadow-xl max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ease-out translate-y-0 z-20"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: isFilterModalOpen
                ? "translateY(0)"
                : "translateY(100%)",
            }} // 나타나는 애니메이션
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">필터 설정</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <IoClose size={24} />
              </button>
            </div>
            {/* 홀 이름 필터 */}
            <div className="flex flex-col space-y-1 mb-4">
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
            {/* 견적서 종류 필터 */}
            <div className="flex flex-col space-y-1 mb-4">
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
                      {`${year}.${
                        month < 10 ? "0" + month : month
                      } (${weekday})`}
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
            <button
              onClick={closeModal}
              className="mt-6 w-full bg-[#ff767b] text-white py-3 rounded-lg font-semibold hover:bg-[#ff5a5f] transition-colors"
            >
              적용하고 닫기
            </button>
          </div>
        </div>
      )}
      {/* --- 모바일 계산기 모달 (하단 시트 형태) --- */}
      {isCalculatorModalOpen && (
        <div
          className="w-full lg:hidden fixed inset-0 bg-black bg-opacity-30 z-[100] flex items-end transition-opacity duration-300 ease-out"
          onClick={closeModal}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-4 pt-5 shadow-xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out translate-y-0"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: isCalculatorModalOpen
                ? "translateY(0)"
                : "translateY(100%)",
            }} // 나타나는 애니메이션
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                견적 계산기
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <IoClose size={24} />
              </button>
            </div>
            {/* 계산기 컴포넌트가 w-full을 가지도록 내부 수정이 필요할 수 있음 */}
            <div className="calculator-modal-content">
              {" "}
              {/* 계산기 너비 조정을 위해 추가적인 div로 감쌀 수 있음 */}
              <Calculator
                standardEstimate={standardEstimate}
                adminEstimate={adminEstimate}
                selectedType={estimateTypeFilter as "standard" | "admin"}
              />
            </div>
          </div>
        </div>
      )}
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
