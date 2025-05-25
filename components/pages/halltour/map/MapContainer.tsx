"use client";

import React from "react";
import { NavermapsProvider } from "react-naver-maps";
import WeddingMap from "./WeddingMap"; // 실제 지도 컴포넌트
import { Hall } from "@/types/hallDetail"; // 타입 정의 경로 수정

interface WeddingHall {
  name: string;
  address: string;
  homepage: string;
  lat: number; // 네이버 좌표계일 수 있으므로 변환 필요
  ceremony_times: string;
  id: number;
  phone: string;
  accessibility: string;
  lng: number; // 네이버 좌표계일 수 있으므로 변환 필요
  halls: Hall[];
}

interface MapContainerProps {
  halls: WeddingHall[];
  ncpClientId: string;
}

export default function MapContainer({
  halls,
  ncpClientId,
}: MapContainerProps) {
  console.log("MapContainer 렌더링 (클라이언트)", ncpClientId); // 브라우저 콘솔에 찍힘

  // NavermapsProvider와 WeddingMap은 클라이언트에서 렌더링
  return (
    <NavermapsProvider ncpClientId={ncpClientId}>
      <WeddingMap halls={halls} />
    </NavermapsProvider>
  );
}
