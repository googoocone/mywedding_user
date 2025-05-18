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
import { CiCalculator1, CiFilter } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { StaticImageData } from "next/image"; // StaticImageData 타입 추가

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

// ImageModal에서 사용하는 Photo 타입을 여기서도 정의하거나 import 할 수 있습니다.
// 여기서는 ImageModal의 Photo 인터페이스와 유사하게 가정합니다.
interface HallPhoto {
  id?: number | string;
  url: string | StaticImageData; // ImageModal의 Photo 인터페이스와 일치
  caption?: string;
  blurDataURL?: string;
  // 실제 데이터에 width, height가 없다면 제거
}

interface Hall {
  id: number;
  name: string;
  mood?: string;
  type?: string | null;
  guarantees?: number;
  interval_minutes?: number;
  parking?: number;
  hall_photos?: HallPhoto[]; // 타입을 HallPhoto[]로 명시
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
  const [areImagesPreloaded, setAreImagesPreloaded] = useState(false); // 이미지 프리로딩 완료 상태

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
          // hall_photos의 타입을 HallPhoto[]로 캐스팅하거나 변환합니다.
          // 백엔드 데이터 구조에 따라 이 부분은 조정이 필요할 수 있습니다.
          const mergedHalls: Hall[] = raw
            .map((item) => {
              const hallData = item.halls?.[0];
              if (hallData && hallData.hall_photos) {
                // hall_photos가 이미 HallPhoto[]와 호환되는 구조라고 가정
                // 만약 아니라면, 여기서 HallPhoto[] 타입으로 변환 필요
                // 예: hallData.hall_photos = hallData.hall_photos.map(p => ({ url: p.some_url_field, ... }))
              }
              return hallData;
            })
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

  // --- 이미지 프리로딩 로직 ---
  useEffect(() => {
    if (
      currentHall &&
      currentHall.hall_photos &&
      currentHall.hall_photos.length > 0
    ) {
      setAreImagesPreloaded(false); // 새 홀 선택 시 프리로딩 상태 초기화
      let loadedImagesCount = 0;
      const photosToPreload: HallPhoto[] = currentHall.hall_photos;
      const totalImages = photosToPreload.length;

      if (totalImages === 0) {
        setAreImagesPreloaded(true);
        return;
      }

      photosToPreload.forEach((photo) => {
        // StaticImageData 타입의 url은 문자열이 아닐 수 있으므로, typeof 체크
        if (typeof photo.url === "string") {
          const img = new Image();
          img.src = photo.url;
          img.onload = () => {
            loadedImagesCount++;
            if (loadedImagesCount === totalImages) {
              setAreImagesPreloaded(true);
              // console.log("모든 홀 사진 프리로딩 완료:", currentHall.name);
            }
          };
          img.onerror = () => {
            loadedImagesCount++; // 오류 발생 시에도 카운트 증가
            console.error("이미지 프리로딩 오류:", photo.url);
            if (loadedImagesCount === totalImages) {
              setAreImagesPreloaded(true);
            }
          };
        } else {
          // StaticImageData거나 URL이 문자열이 아닌 경우 (예: 이미 로드된 next/image 객체)
          // 이 경우 브라우저 레벨의 프리로딩은 불필요하거나 다르게 처리해야 함
          loadedImagesCount++;
          if (loadedImagesCount === totalImages) {
            setAreImagesPreloaded(true);
          }
        }
      });
    } else {
      // 현재 홀에 사진이 없거나 hall_photos가 없으면 프리로딩 완료 상태로 간주
      setAreImagesPreloaded(true);
    }
  }, [currentHall]); // currentHall이 바뀔 때마다 프리로딩 실행

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
  const handleShowAllPhotos = () => {
    // 선택적으로 모든 이미지가 프리로딩될 때까지 기다리거나, 사용자에게 알림을 줄 수 있습니다.
    // if (!areImagesPreloaded) {
    //   alert("사진을 로딩 중입니다. 잠시 후 다시 시도해주세요.");
    //   return;
    // }
    if (
      currentHall &&
      currentHall.hall_photos &&
      currentHall.hall_photos.length > 0
    ) {
      setShowImageModal(true);
    } else {
      // 사진이 없을 경우의 처리 (예: 알림)
      alert("표시할 사진이 없습니다.");
    }
  };
  const handleCloseModal = () => setShowImageModal(false);

  const openFilterModal = () => {
    setIsFilterModalOpen(true);
    setIsCalculatorModalOpen(false);
  };

  const openCalculatorModal = () => {
    setIsCalculatorModalOpen(true);
    setIsFilterModalOpen(false);
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
                meal_types={displayEstimate.meal_prices || ""}
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
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-lg space-y-2 mb-4 top-4">
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
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-[110] flex items-end transition-opacity duration-300 ease-out"
          onClick={closeModal}
        >
          <div
            className="w-full bg-white rounded-t-2xl p-4 pt-5 shadow-xl max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ease-out translate-y-0 z-20"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: isFilterModalOpen
                ? "translateY(0)"
                : "translateY(100%)",
            }}
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
            }}
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
            <div className="calculator-modal-content">
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
      {showImageModal && currentHall && currentHall.hall_photos && (
        <ImageModal
          // currentHall.hall_photos가 이미 ImageModal의 Photo[]와 호환된다고 가정
          // 그렇지 않다면 여기서 필요한 형태로 매핑해야 합니다.
          // 예: photos={currentHall.hall_photos.map(p => ({ url: p.imageUrl, caption: p.desc }))}
          photos={currentHall.hall_photos}
          onClose={handleCloseModal}
          // initialIndex는 필요에 따라 PhotoSection에서 클릭된 이미지 인덱스를 전달받도록 수정 가능
        />
      )}
    </div>
  );
}
