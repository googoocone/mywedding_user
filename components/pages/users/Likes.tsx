"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import HallCard from "@/components/pages/halltour/HallCard"; // HallCard 재사용
import { useRouter } from "next/navigation";

export default function Likes() {
  const { user, loading: userLoading }: any = useContext(AuthContext);
  const router = useRouter();

  const [likedHalls, setLikedHalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLikedHalls() {
      // 사용자 정보 로딩 중이거나, user가 없으면 실행하지 않음
      if (userLoading) {
        setIsLoading(true); // 로딩 중으로 표시
        return;
      }
      if (!user) {
        // 비로그인 상태일 경우, 찜 목록을 가져올 수 없으므로 로딩 완료 처리 후 리다이렉트
        setIsLoading(false);
        setError("로그인이 필요합니다.");
        // alert("로그인이 필요한 서비스입니다."); // 사용자에게 알림
        // router.push("/login"); // 로그인 페이지로 리다이렉트 (선택 사항, 모달 처리할 수도 있음)
        return;
      }

      setIsLoading(true);
      setError(null); // 에러 상태 초기화

      try {
        // 백엔드에서 해당 유저가 찜한 모든 웨딩홀 정보를 가져오는 API 호출
        // (FastAPI에 새로운 엔드포인트가 필요합니다. 아래 설명 참조)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/likes/my_likes`, // ✅ 새로운 엔드포인트
          {
            credentials: "include", // 세션 쿠키 (인증 정보) 포함
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail ||
              `Failed to fetch liked halls: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setLikedHalls(data); // 찜한 웨딩홀 목록 상태 업데이트
      } catch (err: any) {
        console.error("Error fetching liked halls:", err);
        setError(err.message || "찜한 웨딩홀 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    }

    fetchLikedHalls();
  }, [user, userLoading, router]); // user, userLoading이 변경될 때마다 다시 실행

  // HallCard에 넘겨줄 initialIsLiked는 항상 true가 됩니다. (찜 목록이니까)
  // 단, 찜하기/취소 로직은 여전히 HallCard 내에서 처리됩니다.

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-600">
          찜한 웨딩홀 목록을 불러오는 중...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-64 flex items-center justify-center flex-col gap-4">
        <p className="text-lg text-gray-600">로그인이 필요한 서비스입니다.</p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center  px-4 sm:px-0 pb-10 mt-10">
      {likedHalls.length === 0 ? (
        <div className="w-full h-48 flex items-center justify-center text-gray-600 text-lg">
          <p>찜한 웨딩홀이 아직 없어요.</p>
        </div>
      ) : (
        <div className="w-full sm:w-[720px] flex flex-wrap justify-center sm:justify-start gap-5">
          {likedHalls.map((hallData: any) => (
            <HallCard
              key={hallData.id} // 웨딩홀 ID 사용
              data={hallData}
              initialIsLiked={true} // 찜 목록이므로 항상 true
            />
          ))}
        </div>
      )}
    </div>
  );
}
