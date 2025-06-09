"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { AuthContext } from "@/context/AuthContext";
import AlertDialog from "@/components/common/AlertDialog"; // AlertDialog 임포트

export default function HallCard({ data }: { data: any }) {
  const router = useRouter();
  const { user, loading: userLoading }: any = useContext(AuthContext); // AuthContext에서 user와 loading 상태 가져오기

  // 찜 상태를 관리하는 state
  const [isLiked, setIsLiked] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // 초기 찜 상태 로드 완료 여부
  const [isPhoneAuthModalOpen, setIsPhoneAuthModalOpen] = useState(false); // 휴대폰 인증 모달 상태

  // 컴포넌트 마운트 시 찜 상태 초기 로드
  useEffect(() => {
    async function checkLikeStatus() {
      // user 정보 로딩 중이거나, user가 없거나, data.id가 없으면 실행하지 않음
      // data.id는 웨딩홀의 고유 ID (int 타입)
      if (userLoading || !user || !data.id) {
        setInitialLoadComplete(true); // 로드할 정보가 없어도 일단 완료로 표시
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/likes/status/${data.id}`, // FastAPI 엔드포인트에 맞게 경로 확인
          {
            credentials: "include", // 쿠키 (세션 토큰) 전송
          }
        );

        if (res.ok) {
          const { is_liked } = await res.json(); // FastAPI 응답 필드명에 맞춰 is_liked로 변경
          setIsLiked(is_liked);
        } else {
          console.error(
            "Failed to fetch like status:",
            res.status,
            res.statusText
          );
          // 에러 발생 시 기본값 (찜 안 함) 유지
        }
      } catch (err) {
        console.error("Error checking like status:", err);
      } finally {
        setInitialLoadComplete(true); // 초기 로드 완료
      }
    }

    checkLikeStatus();
  }, [user, userLoading, data.id]); // user, userLoading, data.id가 변경될 때마다 실행

  // HallCard 클릭 시 상세 페이지로 이동하는 함수
  const handleClick = () => {
    // data.name을 사용하는 경우, name이 고유한 식별자인지 확인 필요
    // 일반적으로는 고유 ID를 사용하는 것이 더 안전합니다.
    const companyName = data.name; // 웨딩홀 고유 ID를 사용
    const targetUrl = `/halltour/${companyName}`; // ID 기반 URL로 변경하는 것을 고려
    router.push(targetUrl);
  };

  // 찜하기/찜 취소 기능을 토글하는 함수
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지 (상위 handleClick이 실행되지 않도록)

    if (userLoading) {
      console.log("사용자 정보 로딩 중...");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login"); // 로그인 페이지로 리다이렉트
      return;
    }

    // data.id가 유효한지 확인
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
          // FastAPI 엔드포인트에 맞게 경로 확인
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키 (세션 토큰) 전송
          body: JSON.stringify({ wedding_company_id: data.id }), // data.id는 웨딩홀 고유 ID
        });
      } else {
        // 찜하기 요청 (POST)
        res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/likes`, {
          // FastAPI 엔드포인트에 맞게 경로 확인
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키 (세션 토큰) 전송
          body: JSON.stringify({ wedding_company_id: data.id }), // data.id는 웨딩홀 고유 ID
        });
      }

      if (res.ok) {
        setIsLiked((prev) => !prev); // 찜 상태 토글
        // 사용자에게 성공 메시지를 표시할 수도 있습니다.
        // alert(isLiked ? `${data.name} 찜을 취소했습니다.` : `${data.name}을 찜했습니다!`);
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
    e.stopPropagation(); // HallCard 전체 클릭 이벤트 방지

    if (userLoading) {
      console.log("사용자 정보 로딩 중...");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // `user.phone`이 `false` (인증되지 않음)일 때 모달 띄우기
    // `user.phone`이 null이거나 undefined일 수도 있으므로 명시적으로 `=== false`로 비교
    if (user.phone === false) {
      //
      setIsPhoneAuthModalOpen(true); //
      return; //
    }

    // 휴대폰 인증이 완료되었다면 새 창으로 견적서 페이지 이동
    const estimateName = data.name; // 예시: company.id를 견적서 ID로 사용한다고 가정
    // 실제 견적서 페이지 URL에 맞게 수정해주세요 (예: `/wedding-hall/estimate/${estimateId}`)
    window.open(
      `/wedding-hall/updateStandardEstimate?name=${estimateName}`,
      "_blank"
    ); //
  };

  const handlePhoneAuthModalConfirm = () => {
    //
    setIsPhoneAuthModalOpen(false); //
    router.push("/users"); // 휴대폰 인증 페이지로 이동 (마이페이지)
  }; //

  const handlePhoneAuthModalClose = () => {
    //
    setIsPhoneAuthModalOpen(false); //
  }; //

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
      onClick={handleClick} // 클릭 시 handleClick 함수 실행
      className="sm:max-w-[350px] w-full h-[515px] px-4 sm:p-0 cursor-pointer"
    >
      <div className="w-full h-[350px] relative rounded-xl my-1 bg-gray-100 overflow-hidden">
        {data.halls?.[0]?.hall_photos?.[0]?.url && (
          <Image
            fill // 부모 div 크기에 맞춰 채우기
            src={data.halls[0].hall_photos[0].url} // 첫 번째 홀의 첫 번째 사진 URL 사용
            alt={data.name || "웨딩홀 이미지"} // alt 텍스트는 업체명 또는 기본값
            style={{ objectFit: "cover" }} // 이미지 비율 유지하며 영역 채우기
            className="rounded-xl hover:transition-all hover:scale-105 duration-500" // 호버 효과
          />
        )}

        {/* 찜하기 버튼 */}
        <button
          onClick={handleLikeToggle}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/20 cursor-pointer bg-opacity-75
                     flex items-center justify-center shadow-md
                     hover:scale-110 transition-transform duration-200"
          aria-label="찜하기" // 접근성을 위한 레이블
        >
          {isLiked ? (
            <AiFillHeart className="text-red-500 text-2xl" /> // 찜했을 때 채워진 빨간 하트
          ) : (
            <AiOutlineHeart className="text-gray-800 text-2xl" /> // 찜하지 않았을 때 비어있는 회색 하트
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
        <button
          onClick={handleViewEstimate} // 견적서 보기 버튼 클릭 핸들러 연결
          className="px-2 py-1.5"
        >
          상세견적서 보기
        </button>
      </div>

      <AlertDialog // 휴대폰 인증 필요 모달
        isOpen={isPhoneAuthModalOpen} //
        onClose={handlePhoneAuthModalClose} //
        onConfirm={handlePhoneAuthModalConfirm} //
        message="휴대폰 번호 인증을 하시면 상세 견적서를 확인하실 수 있어요!" //
        confirmText="인증하러 가기" //
      />
    </div>
  );
}
