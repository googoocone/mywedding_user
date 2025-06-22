"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { AuthContext } from "@/context/AuthContext";
import AlertDialog from "@/components/common/AlertDialog";

// ✅ props에 initialIsLiked 추가 및 타입 정의
export default function HallCard({
  data,
  initialIsLiked,
}: {
  data: any;
  initialIsLiked?: boolean; // 초기 좋아요 상태를 받을 수 있도록 Optional로 정의
}) {
  const router = useRouter();
  const { user, loading: userLoading }: any = useContext(AuthContext);

  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isPhoneAuthModalOpen, setIsPhoneAuthModalOpen] = useState(false);

  // ✅ 컴포넌트 마운트 시 찜 상태 초기 로드 로직 변경
  // props로 받은 initialIsLiked 값을 isLiked 상태에 반영합니다.
  useEffect(() => {
    if (typeof initialIsLiked !== "undefined") {
      setIsLiked(initialIsLiked);
      setInitialLoadComplete(true); // props를 받았으므로 초기 로드 완료
    } else {
      // initialIsLiked가 undefined로 전달될 경우 (예: 비로그인 사용자)
      setIsLiked(false);
      setInitialLoadComplete(true);
    }
  }, [initialIsLiked]); // initialIsLiked 값이 변경될 때만 실행

  // HallCard 클릭 시 상세 페이지로 이동하는 함수
  const handleClick = () => {
    const companyName = data.name;
    const targetUrl = `/halltour/${companyName}`;
    router.push(targetUrl);
  };

  // 찜하기/찜 취소 기능을 토글하는 함수
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
        // 찜 취소 요청 (DELETE)
        res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/likes`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ wedding_company_id: data.id }),
        });
      } else {
        // 찜하기 요청 (POST)
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
        setIsLiked((prev) => !prev); // 찜 상태 토글
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

  // "상세견적서 보기" 버튼 클릭 핸들러
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
    router.push("/users");
  };

  const handlePhoneAuthModalClose = () => {
    setIsPhoneAuthModalOpen(false);
  };

  const addressParts = data.address?.split(" ") || [];
  const displayAddress =
    addressParts.length > 1
      ? `${addressParts[0]} ${addressParts[1]}`
      : data.address || "주소 정보 없음";

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
      className="sm:max-w-[350px] w-full h-[515px] px-4 sm:p-0 cursor-pointer"
    >
      <div className="w-full h-[350px] relative rounded-xl my-1 bg-gray-100 overflow-hidden">
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

      <div className="text-lg text-gray-500">{displayAddress}</div>

      <div className="text-2xl font-semibold my-1">
        {data.name || "업체명 정보 없음"}
      </div>

      <div className="flex items-center justify-start gap-1 text-sm text-gray-500">
        {data.halls && Array.isArray(data.halls) && data.halls.length > 0 ? (
          <span className="">
            {data.halls.map((hall: any) => `#${hall.name}`).join(" ")}
          </span>
        ) : (
          <span>홀 정보 없음</span>
        )}
      </div>

      <div className="flex gap-2 items-center justify-end">
        <button onClick={handleViewEstimate} className="px-2 py-1.5">
          상세견적서 보기
        </button>
      </div>

      <AlertDialog // 휴대폰 인증 필요 모달
        isOpen={isPhoneAuthModalOpen}
        onClose={handlePhoneAuthModalClose}
        onConfirm={handlePhoneAuthModalConfirm}
        message="휴대폰 번호 인증을 하시면 상세 견적서를 확인하실 수 있어요!"
        confirmText="인증하러 가기"
      />
    </div>
  );
}
