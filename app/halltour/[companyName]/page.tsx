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

export default function HallDetailPage() {
  const params = useParams();
  const companyName = params.companyName;

  // Filters state
  const [hallNameFilter, setHallNameFilter] = useState<string>("");
  const [estimateTypeFilter, setEstimateTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [hall, setHall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Fetch and merge data
  useEffect(() => {
    const fetchDetailWeddingHall = async () => {
      setIsLoading(true);
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
            `${response.status} ${response.statusText} - ${err.detail || ""}`
          );
        }
        const raw = await response.json();
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
          const mergedHalls = raw.map((item) => item.halls[0]);
          setHall({
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
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetailWeddingHall();
  }, [companyName]);

  const allHalls = hall?.halls || [];

  // Default filter values based on data
  useEffect(() => {
    if (!isLoading && allHalls.length > 0) {
      setHallNameFilter(allHalls[0].name);
    }
  }, [isLoading, allHalls]);

  // Available hall names
  const hallNames = useMemo(
    () => Array.from(new Set(allHalls.map((h) => h.name))),
    [allHalls]
  );

  // Estimate types for selected hall
  const estimateTypesForHall: string[] = useMemo(() => {
    const hallObj = allHalls.find((h) => h.name === hallNameFilter);
    if (!hallObj) return [];
    return Array.from(new Set(hallObj.estimates.map((e: any) => e.type)));
  }, [allHalls, hallNameFilter]);

  useEffect(() => {
    if (estimateTypesForHall.length > 0) {
      setEstimateTypeFilter(estimateTypesForHall[0]);
    }
  }, [estimateTypesForHall]);

  // Dates for selected hall and type
  const datesForType = useMemo(() => {
    const hallObj = allHalls.find((h) => h.name === hallNameFilter);
    if (!hallObj) return [];
    return Array.from(
      new Set(
        hallObj.estimates
          .filter((e: any) => e.type === estimateTypeFilter)
          .map((e: any) => e.date)
      )
    ).sort();
  }, [allHalls, hallNameFilter, estimateTypeFilter]);

  useEffect(() => {
    if (datesForType.length > 0) {
      setDateFilter(datesForType[0]);
    }
  }, [datesForType]);

  // Filter halls and estimates
  const filteredHalls = useMemo(() => {
    return allHalls
      .filter((h) => h.name === hallNameFilter)
      .map((h) => ({
        ...h,
        estimates: h.estimates.filter(
          (e: any) => e.type === estimateTypeFilter && e.date === dateFilter
        ),
      }))
      .filter((h) => h.estimates.length > 0);
  }, [allHalls, hallNameFilter, estimateTypeFilter, dateFilter]);

  const selectedHall = filteredHalls[0] || null;
  const selectedEstimate = selectedHall?.estimates[0] || null;

  const handleShowAllPhotos = () => setShowImageModal(true);
  const handleCloseModal = () => setShowImageModal(false);

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

  return (
    <div className="w-full relative flex flex-col items-center justify-center">
      {/* Photo Section */}
      <div className="w-full sm:w-[1250px] flex flex-col items-center justify-start">
        <PhotoSection
          data={selectedHall?.hall_photos || []}
          onShowAllPhotos={handleShowAllPhotos}
        />
      </div>

      {/* Details */}
      <div className="w-full sm:w-[1250px] flex items-start justify-between">
        <div className="w-full sm:w-[750px] flex flex-col items-center">
          <HeaderSection name={hall.name} address={hall.address} />

          <div className=" w-full border-b border-gray-400 my-4"></div>
          {selectedEstimate && (
            <>
              <BasicInfoSection
                name={selectedHall.name}
                mood={selectedHall.mood}
                time={hall.ceremony_times || ""}
                hall_type={selectedHall.type}
                meal_type={selectedEstimate.meal_prices[0]?.meal_type || ""}
                guarantee={selectedHall.guarantees}
                interval_minutes={selectedHall.interval_minutes}
                parking={selectedHall.parking}
                price={selectedEstimate.hall_price}
                meal_price={selectedEstimate.meal_prices}
              />
              <IncludedSection hall_includes={selectedHall.hall_includes} />
              <OptionSection hall_options={selectedEstimate.estimate_options} />
              <EtcSection
                penalty_amount={selectedEstimate.penalty_amount}
                penalty_detail={selectedEstimate.penalty_detail}
                etc={selectedEstimate.etcs[0]?.content || "정보 없음"}
              />
              <HallInfoSection
                address={hall.address}
                phone={hall.phone}
                homepage={hall.homepage}
                accessibility={hall.accessibility}
                lat={hall.lat}
                lng={hall.lng}
              />
            </>
          )}
        </div>
        <div className="hidden sm:flex sm:flex-col sm:w-[400px]  mt-10">
          <div className=" bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-lg space-y-2">
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
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-700">
                견적서 종류
              </span>
              <div className="flex flex-wrap gap-2 my-2">
                {estimateTypesForHall.map((type: string) => (
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
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-700">날짜</span>
              <div className="flex flex-wrap gap-2 my-2">
                {datesForType.map((date: string) => {
                  const parsedDate = new Date(date);
                  const year = parsedDate.getFullYear();
                  const month = parsedDate.getMonth() + 1;
                  const day = parsedDate.getDate();
                  const weekday = parsedDate.toLocaleDateString("ko-KR", {
                    weekday: "short",
                  }); // 월, 화, 수 등

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
              </div>
            </div>
          </div>
          <Calculator></Calculator>
        </div>
      </div>

      {/* Filter Panel - Bottom Right */}

      {showImageModal && (
        <ImageModal
          photos={selectedHall?.hall_photos || []}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
