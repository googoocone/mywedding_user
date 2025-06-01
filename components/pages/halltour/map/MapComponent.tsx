"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Hall } from "@/types/hallDetail"; // 👈 타입 정의 경로가 올바른지 확인하세요!
import Image from "next/image";

import { ImCancelCircle } from "react-icons/im";

// --- 타입 정의 ---
interface WeddingHall {
  name: string;
  address: string;
  homepage: string;
  lat: number;
  ceremony_times: string;
  id: number;
  phone: string;
  accessibility: string;
  lng: number;
  halls: Hall[]; // 이 부분 Hall[] 타입이 WeddingHall 안에 또 Hall을 참조하는지 확인 필요
}

declare global {
  interface Window {
    naver: any;
  }
}

interface MapComponentProps {
  halls: WeddingHall[];
  clientId: string;
}

// --- 좌표 변환 함수 ---
const convertCoords = (coord: number): number => {
  return coord / 10000000;
};

// --- React 컴포넌트 ---
export default function MapComponent({ halls, clientId }: MapComponentProps) {
  const [selectedHall, setSelectedHall] = useState<WeddingHall | null>(null);
  console.log("selectedHall", selectedHall);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // --- 스크립트 로딩 함수 ---
  const loadNaverMapsScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const scriptId = "naver-maps-script";
      if (document.getElementById(scriptId)) {
        const checkReady = () => {
          if (window.naver && window.naver.maps) {
            console.log("네이버 지도 스크립트 이미 로드되어 있고 API 준비됨.");
            resolve();
          } else {
            console.log("기존 스크립트 로딩 대기 중...");
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
        return;
      }
      console.log("네이버 지도 스크립트 로딩 시작...");
      const script = document.createElement("script");
      script.id = scriptId;
      // 🚨 ncpClientId 로 변경했습니다! 🚨
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("네이버 지도 스크립트 로딩 성공.");
        resolve();
      };
      script.onerror = (error) => {
        console.error("네이버 지도 스크립트 로딩 실패:", error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }, [clientId]);

  // --- 지도 초기화 및 마커/텍스트 추가 함수 ---
  const initMap = useCallback(() => {
    const mapDiv = document.getElementById("map");
    if (!mapDiv || !window.naver || !window.naver.maps) {
      console.error("지도 Div 또는 네이버 API 준비 안됨.");
      return;
    }
    if (mapRef.current) {
      console.log("지도가 이미 존재하여 초기화 건너뜀.");
      // 이전 마커들 제거 (halls 데이터가 변경되었을 경우를 대비)
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    }

    console.log("지도 초기화 시작...");
    const initialCenter = new window.naver.maps.LatLng(37.4979, 127.0276); // 강남역 (초기값)
    const map =
      mapRef.current ||
      new window.naver.maps.Map("map", {
        // 기존 맵이 없으면 새로 생성
        center: initialCenter,
        zoom: 16,
      });
    if (!mapRef.current) {
      mapRef.current = map;
    }

    if (!halls || halls.length === 0) {
      console.log("표시할 웨딩홀 데이터가 없습니다.");
      return;
    }

    const bounds = new window.naver.maps.LatLngBounds();
    const newMarkers: any[] = [];

    halls.forEach((hall) => {
      // 🚨 lat, lng 할당 수정! hall.lat -> lat, hall.lng -> lng 🚨
      const lat = convertCoords(hall.lng);
      const lng = convertCoords(hall.lat);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn("잘못된 좌표값:", hall.name, hall.lat, hall.lng);
        return;
      }

      const position = new window.naver.maps.LatLng(lat, lng);

      const originalBgColor = "#ff767b"; // 기존 배경색
      const hoverBgColor = "#e05a5f"; // 호버 시 변경될 더 진한 배경색 (예시)

      const markerContent = `
        <div style="cursor:pointer; text-align:center; position:relative;">
            <div 
                style="position:absolute; left:50%; transform:translateX(-50%); top:30px; background-color:${originalBgColor}; color:white; border-radius:20px; padding:8px 16px; /* 기존 border-radius:3px 대신 20px 적용 */ font-size:11px; font-weight:600; white-space:nowrap; border:1px solid #dd6368; /* 테두리 색상도 배경에 맞춰 살짝 변경 */ box-shadow: 0 1px 2px rgba(0,0,0,0.1);"
                onmouseover="this.style.backgroundColor='${hoverBgColor}'"
                onmouseout="this.style.backgroundColor='${originalBgColor}'"
            >
                ${hall.name}
            </div>
        </div>
    `;
      // 위 핀 이미지 경로('/images/default_pin.png')는 실제 프로젝트의 핀 이미지 경로로 수정해야 합니다.
      // public 폴더에 이미지를 넣고 /images/default_pin.png 처럼 절대 경로로 접근

      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        title: hall.name, // 마우스 오버 시 툴팁 (선택적)
        icon: {
          content: markerContent,
          // HTML 콘텐츠의 기준점. 핀 이미지의 하단 중앙으로 설정 (핀 이미지 크기에 따라 조절)
          anchor: new window.naver.maps.Point(11, 30), // 핀 이미지 너비 22px, 높이 30px 기준
        },
      });
      newMarkers.push(marker);

      window.naver.maps.Event.addListener(marker, "click", () => {
        setSelectedHall(hall);
        map.panTo(position); // 클릭 시 해당 위치로 부드럽게 이동
        if (map.getZoom() < 14) map.setZoom(14); // 확대
      });

      bounds.extend(position);
    });

    markersRef.current = newMarkers;

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 100, left: 50 }); // 여백(padding) 설정 가능
      // fitBounds 후 너무 확대되었으면 줌 레벨 조정
      if (halls.length === 1 && map.getZoom() > 16) {
        map.setZoom(16);
      } else if (map.getZoom() > 17) {
        // 여러 개일 때 최대 줌
        map.setZoom(17);
      }
    }
  }, [halls, clientId]); // mapRef.current는 의존성에서 제거 (useRef이기 때문)

  // --- 메인 useEffect ---
  useEffect(() => {
    if (!clientId) {
      console.error("클라이언트 ID 없음.");
      return;
    }
    loadNaverMapsScript()
      .then(() => {
        // initMap을 호출하기 전에 window.naver.maps가 확실히 로드되었는지 한번 더 확인
        if (window.naver && window.naver.maps) {
          initMap();
        } else {
          // 스크립트는 로드되었으나 API 객체가 아직 준비되지 않은 경우 대비
          // (이 경우는 loadNaverMapsScript 내부에서 처리하려고 했지만, 추가적인 안전장치)
          console.warn("Naver API 객체 로딩 대기 중... 재시도합니다.");
          setTimeout(initMap, 200); // 약간의 지연 후 initMap 재시도
        }
      })
      .catch((error) => console.error("스크립트 로드 실패:", error));

    return () => {
      console.log("MapComponent 언마운트 - 클린업 실행");
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      // mapRef.current?.destroy(); // 네이버 지도 v3에는 destroy()가 명시적으로 없을 수 있음
      const mapDiv = document.getElementById("map");
      if (mapDiv) mapDiv.innerHTML = ""; // 컨테이너 비우기
      mapRef.current = null;
    };
  }, [clientId, halls, loadNaverMapsScript, initMap]); // initMap과 loadNaverMapsScript도 의존성으로 추가

  // --- JSX 렌더링 ---
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div id="map" style={{ width: "100%", height: "100%" }}>
        {/* 지도가 렌더링되는 영역입니다. */}
      </div>

      {selectedHall && (
        <div
          className="absolute bottom-[10%] sm:bottom-[20%] left-1/2 -translate-x-1/2 
                     p-[10px] rounded-lg shadow-lg bg-white hover:bg-gray-100
                     z-[1000] text-center cursor-pointer w-[90%] sm:w-[470px] h-[150px]"
        >
          <Link
            href={`/halltour/${selectedHall.name}`}
            passHref
            className="flex items-center justify-start no-underline text-current h-full" // Link에 스타일 적용, 높이 100% 추가
          >
            <div className="w-[130px] h-[130px] relative flex-shrink-0">
              {/* 이미지 영역이 줄어들지 않도록 flex-shrink-0 추가 */}
              <Image
                src={
                  selectedHall.halls[0]?.hall_photos[0]?.url ||
                  "/placeholder-image.jpg"
                } // 옵셔널 체이닝 및 대체 이미지 경로 추가
                fill
                alt={selectedHall.name}
                className="object-cover rounded-md" // 이미지 내부 스타일링
              />
            </div>
            <div
              className="flex-1 min-w-0 px-3 text-left flex flex-col gap-1 justify-center" // 수직 중앙 정렬을 위해 justify-center 추가
            >
              <h3 className="text-xl sm:text-2xl font-semibold truncate">
                {selectedHall.name}
              </h3>
              {/* 긴 이름에 truncate 추가 */}
              <p className="text-sm truncate">{selectedHall.address}</p>
              {/* 긴 주소에 truncate 추가 */}
              <p className="text-sm">{selectedHall.phone || "정보 없음"}</p>
              <small className="text-gray-500">(클릭하여 상세 정보 보기)</small>
            </div>
          </Link>
          <button
            className="absolute top-[10px] right-[10px] bg-transparent border-none 
                       cursor-pointer text-gray-600 hover:text-red-500 p-1 rounded-full" // 아이콘 색상 및 호버, 패딩, 둥근 테두리 추가
            onClick={(e) => {
              e.stopPropagation(); // 버튼 클릭이 Link로 전파되는 것을 막음
              setSelectedHall(null);
            }}
            aria-label="닫기" // 접근성을 위한 aria-label 추가
          >
            <ImCancelCircle size={20} /> {/* 아이콘 크기 조절 */}
          </button>
        </div>
      )}
    </div>
  );
}
