"use client";

import { useEffect, useState } from "react";
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
  const companyId = params.companyId;

  const [hall, setHall] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 유지
  const [error, setError] = useState<string | null>(null); // 에러 상태 유지

  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  // 사진 모두 보기 버튼 클릭 시 실행될 함수
  const handleShowAllPhotos = () => {
    setShowImageModal(true);
  };

  // 모달 닫기 함수
  const handleCloseModal = () => {
    setShowImageModal(false);
  };

  useEffect(() => {
    const fetchDetailWeddingHall = async () => {
      setIsLoading(true); // 데이터 페칭 시작 시 로딩 상태 활성화
      try {
        const apiEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/hall/get_detail_wedding_hall/${companyId}`;

        const response = await fetch(apiEndpoint, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(
            `Failed to fetch halls: ${response.status} ${
              response.statusText
            } - ${errorBody.detail || ""}`
          );
        }

        const data = await response.json();
        console.log("hall", hall);
        setHall(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch detail wedding halls.");
        console.error("Error fetching wedding halls:", err);
      } finally {
        setIsLoading(false); // 데이터 페칭 완료 시 (성공/실패 무관) 로딩 상태 비활성화
      }
    };

    fetchDetailWeddingHall();
  }, [companyId]);

  // 로딩 중이면 로딩 메시지 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        로딩 중...
      </div>
    );
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-red-600">
        오류 발생: {error}
      </div>
    );
  }

  console.log("main_hall", hall);
  const mainHallPhotos = hall.halls[0].hall_photos;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* 사진 부분 */}
      <div className="w-full sm:w-[1250px] flex flex-col items-center justify-start">
        <PhotoSection
          onShowAllPhotos={handleShowAllPhotos}
          data={mainHallPhotos}
        ></PhotoSection>
      </div>
      <div className="w-full sm:w-[1250px]  flex items-start justify-between">
        <div className="w-full sm:w-[750px] flex flex-col items-center justify-between">
          <HeaderSection
            name={hall.name}
            address={hall.address}
          ></HeaderSection>
          <BasicInfoSection
            name={hall.halls[0].name}
            mood={hall.halls[0].mood}
            time={hall?.ceremony_times || ""}
            hall_type={hall?.halls[0]?.type}
            meal_type={hall?.halls[0].estimates[0]?.meal_prices[0].meal_type}
            guarantee={hall.halls[0].guarantees}
            interval_minutes={hall.halls[0].interval_minutes}
            parking={hall.halls[0].parking}
            price={hall.halls[0].estimates[0].hall_price}
            meal_price={hall.halls[0].estimates[0]?.meal_prices}
          ></BasicInfoSection>
          <IncludedSection
            hall_includes={hall.halls[0].hall_includes}
          ></IncludedSection>
          <OptionSection
            hall_options={hall.halls[0].estimates[0].estimate_options}
          ></OptionSection>
          <EtcSection
            penalty_amount={hall.halls[0].estimates[0]?.penalty_amount || ""}
            penalty_detail={hall.halls[0].estimates[0]?.penalty_detail || ""}
            etc={hall.halls[0].estimates[0].etcs[0]?.etc || "정보 없음"}
          ></EtcSection>
          <HallInfoSection
            address={hall.address}
            phone={hall.phone}
            homepage={hall.homepage}
            accessibility={hall.accessibility}
            lat={hall.lat}
            lng={hall.lng}
          ></HallInfoSection>
        </div>
        {/* <Calculator></Calculator> */}
      </div>
      {showImageModal && (
        <ImageModal
          photos={mainHallPhotos} // 전체 사진 목록 전달
          onClose={handleCloseModal} // 모달 닫기 함수 전달
        />
      )}
    </div>
  );
}
