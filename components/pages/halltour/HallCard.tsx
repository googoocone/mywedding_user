"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { AuthContext } from "@/context/AuthContext";
import AlertDialog from "@/components/common/AlertDialog";

export default function HallCard({
  data,
  initialIsLiked,
}: {
  data: any;
  initialIsLiked?: boolean;
}) {
  const router = useRouter();
  const { user, loading: userLoading }: any = useContext(AuthContext);

  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isPhoneAuthModalOpen, setIsPhoneAuthModalOpen] = useState(false);

  useEffect(() => {
    if (typeof initialIsLiked !== "undefined") {
      setIsLiked(initialIsLiked);
      setInitialLoadComplete(true);
    } else {
      setIsLiked(false);
      setInitialLoadComplete(true);
    }
  }, [initialIsLiked]);

  const handleClick = () => {
    const companyName = data.name;
    const targetUrl = `/halltour/${companyName}`;
    router.push(targetUrl);
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (userLoading) {
      console.log("사용자 정보 로딩 중...");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (!data.id) {
      console.error("웨딩홀 ID가 없습니다. 찜 기능을 수행할 수 없습니다.");
      alert("웨딩홀 정보가 불완전하여 찜 기능을 사용할 수 없습니다.");
      return;
    }

    try {
      let res;
      if (isLiked) {
        res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/likes`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ wedding_company_id: data.id }),
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/likes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ wedding_company_id: data.id }),
        });
      }

      if (res.ok) {
        setIsLiked((prev) => !prev);
      } else {
        const errorData = await res.json();
        console.error("API Error:", errorData.detail || res.statusText);
        alert(errorData.detail || "찜하기/취소에 실패했습니다.");
      }
    } catch (err) {
      console.error("Network or unexpected error:", err);
      alert("서버와의 통신 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleViewEstimate = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (userLoading) {
      console.log("사용자 정보 로딩 중...");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (user.phone === false) {
      setIsPhoneAuthModalOpen(true);
      return;
    }

    const estimateName = data.name;
    window.open(
      `/wedding-hall/updateStandardEstimate?name=${estimateName}`,
      "_blank"
    );
  };

  const handlePhoneAuthModalConfirm = () => {
    setIsPhoneAuthModalOpen(false);
    router.push("/login");
  };

  const handlePhoneAuthModalClose = () => {
    setIsPhoneAuthModalOpen(false);
  };

  // ✅ 주소 형식 변경 및 '시'와 '구' 분리 로직
  const getFormattedAddressParts = (address: string | undefined) => {
    if (!address) return { city: "정보없음", district: "" };

    let cityPart = "";
    let districtPart = "";

    const parts = address.split(" ");
    if (parts.length > 0) {
      // 첫 번째 부분에서 '특별시', '광역시', '도' 등을 제거
      cityPart = parts[0]
        .replace(/특별시/g, "")
        .replace(/광역시/g, "")
        .replace(/도/g, "")
        .replace(/시/g, ""); // '시'도 제거
    }
    if (parts.length > 1) {
      // 두 번째 부분에서 '구'를 제거
      districtPart = parts[1];
    }

    return { city: cityPart.trim(), district: districtPart.trim() };
  };

  const { city, district } = getFormattedAddressParts(data.address);

  if (!initialLoadComplete) {
    return (
      <div className="sm:max-w-[350px] w-full h-[515px] px-4 sm:p-0 cursor-pointer animate-pulse">
        <div className="w-full h-[350px] relative rounded-xl my-1 bg-gray-200 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3 ml-auto mt-4 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="sm:max-w-[250px] w-full h-[415px] px-4 sm:p-0 cursor-pointer"
    >
      <div className="w-full h-[250px] relative rounded-xl my-1 bg-gray-100 overflow-hidden">
        {data.halls?.[0]?.hall_photos?.[0]?.url && (
          <Image
            fill
            src={data.halls[0].hall_photos[0].url}
            alt={data.name || "웨딩홀 이미지"}
            style={{ objectFit: "cover" }}
            className="rounded-xl hover:transition-all hover:scale-105 duration-500"
          />
        )}

        {/* 찜하기 버튼 */}
        <button
          onClick={handleLikeToggle}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/20 cursor-pointer bg-opacity-75
                       flex items-center justify-center shadow-md
                       hover:scale-110 transition-transform duration-200"
          aria-label="찜하기"
        >
          {isLiked ? (
            <AiFillHeart className="text-red-500 text-2xl" />
          ) : (
            <AiOutlineHeart className="text-gray-800 text-2xl" />
          )}
        </button>
      </div>

      {/* ✅ 주소 div 수정: '시'와 '구'를 분리하고 각각 다른 배경색 적용 */}
      <div className="flex items-center gap-1 text-sm text-gray-800 my-2">
        {city && (
          <span
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: "#F4FAFC" }} // 서울, 부산 등 '시' 부분
          >
            {city}
          </span>
        )}
        {district && (
          <span
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: "#FFEFEE" }} // 영등포, 강남 등 '구' 부분
          >
            {district}
          </span>
        )}
      </div>

      <div className="text-xl font-semibold my-1 truncate">
        {data.name || "업체명 정보 없음"}
      </div>

      <div className="flex items-center justify-start gap-1 text-sm text-gray-500">
        {data.halls && Array.isArray(data.halls) && data.halls.length > 0 ? (
          <span className="truncate">
            {data.halls.map((hall: any) => `#${hall.name}`).join(" ")}
          </span>
        ) : (
          <span>홀 정보 없음</span>
        )}
      </div>

      <div className="flex gap-2 items-center justify-start text-sm mt-1 ">
        <button
          onClick={handleViewEstimate}
          className="flex items-center group"
        >
          <span className="underline group-hover:no-underline transition-all duration-200 cursor-pointer">
            할인견적서 보기
          </span>
          <Image
            src="/next.png" // next.png 이미지 경로 (public 폴더 기준)
            alt="next icon"
            width={14} // 이미지 너비 조절
            height={14} // 이미지 높이 조절
            className="ml-1 group-hover:translate-x-1 transition-transform duration-200 cursor-pointer" // 텍스트와 이미지 사이 간격
          />
        </button>
      </div>

      <AlertDialog // 휴대폰 인증 필요 모달
        isOpen={isPhoneAuthModalOpen}
        onClose={handlePhoneAuthModalClose}
        onConfirm={handlePhoneAuthModalConfirm}
        message="3초만에 로그인하고, 할인 견적서 2천개를 확인하세요"
        confirmText="인증하러 가기"
      />
    </div>
  );
}
