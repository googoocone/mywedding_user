"use client";

import React, { useState, useEffect } from "react";
import {
  Container as MapDiv,
  NaverMap,
  Marker,
  useNavermaps,
} from "react-naver-maps";
import Link from "next/link";
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

const convertCoords = (coord: number): number => {
  return coord / 10000000;
};

interface WeddingMapProps {
  halls: WeddingHall[];
}

const WeddingMap: React.FC<WeddingMapProps> = ({ halls }) => {
  const navermaps = useNavermaps();
  const [selectedHall, setSelectedHall] = useState<WeddingHall | null>(null);

  // 강남역 좌표 (예시)
  const gangnamStation = new navermaps.LatLng(37.4979, 127.0276);

  const handleMarkerClick = (hall: WeddingHall) => {
    setSelectedHall(hall);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <MapDiv style={{ width: "100%", height: "100%" }}>
        <NaverMap defaultCenter={gangnamStation} defaultZoom={12}>
          {halls.map((hall) => (
            <Marker
              key={hall.id}
              position={
                new navermaps.LatLng(
                  convertCoords(hall.lat),
                  convertCoords(hall.lng)
                )
              }
              title={hall.name} // 마커에 마우스 올리면 이름 표시
              onClick={() => handleMarkerClick(hall)}
            />
          ))}
        </NaverMap>
      </MapDiv>

      {/* 정보 패널 */}
      {selectedHall && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            padding: "15px 25px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            textAlign: "center",
            cursor: "pointer",
            minWidth: "300px",
          }}
        >
          <Link href={`/wedding-hall/${selectedHall.id}`} passHref>
            <div style={{ textDecoration: "none", color: "inherit" }}>
              <h3>{selectedHall.name}</h3>
              <p>{selectedHall.address}</p>
              <p>전화: {selectedHall.phone || "정보 없음"}</p>
              <small>(클릭하여 상세 정보 보기)</small>
            </div>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Link로의 이벤트 전파 방지
              setSelectedHall(null);
            }}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              background: "none",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
};

export default WeddingMap;
