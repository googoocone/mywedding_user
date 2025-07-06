"use client";

import { useEffect, useState, useMemo, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { StaticImageData } from "next/image";
import { AuthContext } from "@/context/AuthContext";

// --- 타입 정의 (기존과 동일) ---
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
interface HallPhoto {
  id?: number | string;
  url: string | StaticImageData;
  caption?: string;
  blurDataURL?: string;
}
interface Hall {
  id: number;
  name: string;
  mood?: string;
  type?: string | null;
  guarantees?: number;
  interval_minutes?: number;
  parking?: number;
  hall_photos?: HallPhoto[];
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
  const { user, loading: userLoading }: any = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const companyNameParam = params.companyName;
  const companyName = Array.isArray(companyNameParam)
    ? companyNameParam[0]
    : companyNameParam;

  // --- 상태 변수 (기존과 동일) ---
  const [hallNameFilter, setHallNameFilter] = useState<string>("");
  const [estimateTypeFilter, setEstimateTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [hallCompany, setHallCompany] = useState<HallCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [areImagesPreloaded, setAreImagesPreloaded] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

  // --- 데이터 로딩 (기존과 동일) ---
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
          const mergedHalls: Hall[] = raw
            .map((item) => item.halls?.[0])
            .filter(Boolean);

          setHallCompany({
            id: base.id,
            phone: base.phone,
            accessibility: base.accessibility,
            lng: base.lng,
            address: base.address,
            name: base.name,
            homepage: base.homepage,
            lat: base.lat,
            ceremony_times: base.ceremony_times,
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

  // --- 파생 상태 및 필터 로직 (기존과 동일) ---
  const allHalls: Hall[] = hallCompany?.halls || [];
  const hallNames = useMemo(
    () => Array.from(new Set(allHalls.map((h) => h.name))),
    [allHalls]
  );
  const currentHall = useMemo(
    () => allHalls.find((h) => h.name === hallNameFilter),
    [allHalls, hallNameFilter]
  );
  const estimateTypesForDateButtons = useMemo(() => {
    if (!currentHall) return [];
    const types = new Set(currentHall.estimates.map((e) => e.type));
    return Array.from(types).sort((a, b) => (a === "standard" ? -1 : 1));
  }, [currentHall]);
  const filteredDates = useMemo(() => {
    if (!currentHall || !estimateTypeFilter) return [];
    const dates = new Set(
      currentHall.estimates
        .filter((e) => e.type === estimateTypeFilter)
        .map((e) => e.date)
    );
    return Array.from(dates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [currentHall, estimateTypeFilter]);
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
    const admEst: Estimate | null = dateFilter
      ? currentHall.estimates.find(
          (e) => e.date === dateFilter && e.type === "admin"
        ) || null
      : null;
    const dispEst: Estimate | null =
      estimateTypeFilter === "admin" && admEst ? admEst : stdEst;
    return {
      standardEstimate: stdEst,
      adminEstimate: admEst,
      displayEstimate: dispEst,
    };
  }, [currentHall, dateFilter, estimateTypeFilter]);

  // --- 필터 기본값 설정 로직 (기존과 동일) ---
  useEffect(() => {
    if (!isLoading && !hallNameFilter && hallNames.length > 0) {
      setHallNameFilter(hallNames[0]);
    }
  }, [isLoading, hallNames, hallNameFilter]);
  useEffect(() => {
    if (currentHall) {
      const defaultType = "standard";
      if (estimateTypeFilter !== defaultType) {
        setEstimateTypeFilter(defaultType);
        setDateFilter("");
      }
    }
  }, [currentHall, estimateTypesForDateButtons]);
  useEffect(() => {
    if (filteredDates.length > 0 && !filteredDates.includes(dateFilter)) {
      setDateFilter(filteredDates[0]);
    } else if (filteredDates.length === 0) {
      setDateFilter("");
    }
  }, [filteredDates, dateFilter]);

  // --- 이미지 프리로딩 로직 (기존과 동일) ---
  useEffect(() => {
    if (
      currentHall &&
      currentHall.hall_photos &&
      currentHall.hall_photos.length > 0
    ) {
      setAreImagesPreloaded(false);
      let loadedImagesCount = 0;
      const photosToPreload: HallPhoto[] = currentHall.hall_photos;
      const totalImages = photosToPreload.length;
      if (totalImages === 0) {
        setAreImagesPreloaded(true);
        return;
      }
      photosToPreload.forEach((photo) => {
        if (typeof photo.url === "string") {
          const img = new Image();
          img.src = photo.url;
          img.onload = () => {
            loadedImagesCount++;
            if (loadedImagesCount === totalImages) {
              setAreImagesPreloaded(true);
            }
          };
          img.onerror = () => {
            loadedImagesCount++;
            console.error("이미지 프리로딩 오류:", photo.url);
            if (loadedImagesCount === totalImages) {
              setAreImagesPreloaded(true);
            }
          };
        } else {
          loadedImagesCount++;
          if (loadedImagesCount === totalImages) {
            setAreImagesPreloaded(true);
          }
        }
      });
    } else {
      setAreImagesPreloaded(true);
    }
  }, [currentHall]);

  // --- ⭐️ [추가] 블러 및 로그인 유도 조건 변수 ---
  const isContentLocked =
    !userLoading && !user && estimateTypeFilter === "admin";

  // --- 이벤트 핸들러 (기존과 동일) ---
  const handleShowAllPhotos = () => {
    if (!areImagesPreloaded) {
      alert("사진을 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (
      currentHall &&
      currentHall.hall_photos &&
      currentHall.hall_photos.length > 0
    ) {
      setShowImageModal(true);
    } else {
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
  const isPreferTime = (timeString) => {
    if (!timeString || typeof timeString !== "string") {
      return false;
    }
    const preferredStartMinutes = 11 * 60;
    const preferredEndMinutes = 14.5 * 60;
    const parseTimeToMinutes = (timeStr) => {
      const parts = timeStr.split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        return NaN;
      }
      return hours * 60 + minutes;
    };
    const timeSlots = timeString.match(/\d{1,2}:\d{2}/g);
    if (!timeSlots) {
      return false;
    }
    for (const slotStr of timeSlots) {
      const slotMinutes = parseTimeToMinutes(slotStr);
      if (!isNaN(slotMinutes)) {
        if (
          slotMinutes >= preferredStartMinutes &&
          slotMinutes <= preferredEndMinutes
        ) {
          return "메인타임(14:30 이내)";
        }
      }
    }
    return "서브타임(14:30 이후)";
  };

  // --- 로딩 / 에러 / 데이터 없음 처리 (기존과 동일) ---
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

  // --- 필터 UI 렌더링 함수 (기존과 동일) ---
  const renderFilterContent = () => (
    <>
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
      <div className="flex flex-col space-y-1 mb-4">
        <span className="text-sm font-medium text-gray-700">견적서 종류</span>
        <div className="flex flex-wrap gap-2 my-2">
          {estimateTypesForDateButtons.map((type) => (
            <button
              key={type}
              onClick={() => setEstimateTypeFilter(type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                estimateTypeFilter === type
                  ? "bg-[#ffe4de] text-[#ff767b]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "standard" ? "일반 견적서" : "할인 견적서"}
            </button>
          ))}
          {estimateTypesForDateButtons.length === 0 && (
            <span className="text-xs text-gray-400">견적서 정보 없음</span>
          )}
        </div>
      </div>
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-gray-700">날짜 선택</span>
        <div className="flex flex-wrap gap-2 my-2">
          {filteredDates.map((date: string) => {
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
                {`${year}.${month < 10 ? "0" + month : month} (${weekday})`}
              </button>
            );
          })}
          {estimateTypeFilter && filteredDates.length === 0 && currentHall && (
            <span className="text-xs text-gray-400">
              선택하신 종류의 견적이 있는 날짜가 없습니다.
            </span>
          )}
        </div>
      </div>
    </>
  );

  // --- ⭐️ [추가] 로그인 유도 오버레이 UI 렌더링 함수 ---
  const renderLoginPrompt = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-lg p-4 bg-white/20 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          로그인이 필요합니다
        </h3>
        <p className="text-gray-600 mb-6">
          3초만에 로그인하고 2천장의 할인견적서를 확인하세요!
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-[#ff767b] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#ff5a5f] transition-colors shadow-lg"
        >
          로그인하고 상세 견적 보기
        </button>
      </div>
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
        <div className="relative w-full lg:w-[750px] flex flex-col items-center mb-8 lg:mb-0 px-4 sm:px-0">
          {/* ⭐️ [수정] isContentLocked 변수 사용 */}
          <div
            className={`w-full transition-filter duration-300 ${
              isContentLocked ? "blur-sm select-none" : ""
            }`}
          >
            <HeaderSection
              name={hallCompany.name}
              address={hallCompany.address}
            />
            <div className="w-full text-right text-sm my-3">
              <span className="px-3 py-1.5 bg-gray-700 text-white rounded-full">
                {isPreferTime(displayEstimate?.time)}
              </span>
            </div>
            <div className="w-full border-b border-gray-400 my-2"></div>
            {displayEstimate ? (
              <>
                <BasicInfoSection
                  standardEstimate={standardEstimate}
                  adminEstimate={adminEstimate}
                  displayEstimate={displayEstimate}
                  name={currentHall?.name || ""}
                  mood={currentHall?.mood || ""}
                  time={hallCompany.ceremony_times || ""}
                  hall_type={currentHall?.type || ""}
                  guarantee={currentHall?.guarantees || 0}
                  interval_minutes={currentHall?.interval_minutes || 0}
                  parking={currentHall?.parking || 0}
                  price={displayEstimate.hall_price}
                  meal_prices={displayEstimate.meal_prices || []}
                />
                <IncludedSection
                  hall_includes={currentHall?.hall_includes || []}
                />
                <OptionSection
                  standardEstimate={standardEstimate}
                  adminEstimate={adminEstimate}
                  displayEstimate={displayEstimate}
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
              <div className="mt-8 text-center text-gray-500 py-20">
                선택하신 조건에 맞는 상세 견적 정보가 없습니다.
              </div>
            )}
          </div>

          {/* ⭐️ [수정] isContentLocked 변수 사용 및 오버레이 컴포넌트 화 */}
          {isContentLocked && renderLoginPrompt()}
        </div>

        {/* 오른쪽 필터 & 계산기 (데스크톱용) */}
        <div className="w-full lg:w-[400px] mt-10 lg:mt-10 hidden lg:block">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-lg space-y-2 mb-4 top-4">
            {renderFilterContent()}
          </div>
          <div className="sticky top-[calc(4rem+180px)]">
            {/* ⭐️ [수정] 계산기 영역에 블러 및 로그인 유도 오버레이 적용 */}
            <div className="relative">
              <div
                className={`transition-filter duration-300 ${
                  isContentLocked ? "blur-sm select-none" : ""
                }`}
              >
                <Calculator
                  standardEstimate={standardEstimate}
                  adminEstimate={adminEstimate}
                  selectedType={estimateTypeFilter as "standard" | "admin"}
                />
              </div>
              {isContentLocked && renderLoginPrompt()}
            </div>
          </div>
        </div>
      </div>
      {/* --- 모바일 하단 고정 버튼 (기존과 동일) --- */}
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
        <div className="w-px h-full bg-gray-200"></div>
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
          견적서 계산기
        </button>
      </div>

      {/* --- 모바일 필터 모달 (기존과 동일) --- */}
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
            {renderFilterContent()}
            <button
              onClick={closeModal}
              className="mt-6 w-full bg-[#ff767b] text-white py-3 rounded-lg font-semibold hover:bg-[#ff5a5f] transition-colors"
            >
              적용하고 닫기
            </button>
          </div>
        </div>
      )}

      {/* --- 모바일 계산기 모달 --- */}
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
              <h3 className="text-lg font-semibold text-gray-800"></h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <IoClose size={24} />
              </button>
            </div>
            {/* ⭐️ [수정] 모바일 계산기 모달에 블러 및 로그인 유도 오버레이 적용 */}
            <div className="calculator-modal-content relative">
              <div
                className={`transition-filter duration-300 ${
                  isContentLocked ? "blur-sm select-none" : ""
                }`}
              >
                <Calculator
                  standardEstimate={standardEstimate}
                  adminEstimate={adminEstimate}
                  selectedType={estimateTypeFilter as "standard" | "admin"}
                />
              </div>
              {isContentLocked && renderLoginPrompt()}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal (기존과 동일) */}
      {showImageModal && currentHall && currentHall.hall_photos && (
        <ImageModal
          photos={currentHall.hall_photos}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
