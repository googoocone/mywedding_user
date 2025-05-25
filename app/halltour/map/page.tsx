import React from "react";
import MapComponent from "@/components/pages/halltour/map/MapComponent"; // 새로 만들거나 수정할 클라이언트 컴포넌트
import { WeddingHall } from "@/types/weddingHall"; // 타입 경로 확인

async function getWeddingHalls(): Promise<WeddingHall[]> {
  const apiEndpoint = `http://localhost:8000/hall/get_wedding_halls`;
  console.log("MapPage(서버): getWeddingHalls 호출");
  try {
    const response = await fetch(apiEndpoint, { cache: "no-store" });
    if (!response.ok) {
      console.error("MapPage(서버): Fetch 실패 -", response.statusText);
      return [];
    }
    const data = await response.json();

    return data || [];
  } catch (error) {
    console.error("MapPage(서버): Fetch 중 에러 -", error);
    return [];
  }
}

export default async function MapPage() {
  const weddingHalls = await getWeddingHalls();
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID; // 환경변수 우선, 없으면 하드코딩 (테스트용)

  if (!naverMapClientId) {
    return <div>네이버 지도 Client ID가 설정되지 않았습니다.</div>;
  }

  // 클라이언트 컴포넌트에 데이터와 ID 전달
  return <MapComponent halls={weddingHalls} clientId={naverMapClientId} />;
}
