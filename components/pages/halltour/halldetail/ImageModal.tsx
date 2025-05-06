"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { IoCloseCircleOutline } from "react-icons/io5"; // 닫기 버튼 아이콘
import { IoChevronBack, IoChevronForward } from "react-icons/io5"; // 이전/다음 버튼 아이콘

// PhotoSection에서 넘겨주는 사진 객체 하나의 타입 정의 (필요에 따라 더 추가 가능)
interface Photo {
  id?: number; // id는 선택 사항일 수 있습니다.
  url: string; // 이미지 URL은 필수
  caption?: string; // 사진 설명 (alt 텍스트 등으로 활용)
  // 필요한 다른 사진 정보 속성들을 추가하세요.
}

// ImageModal 컴포넌트가 받을 props 타입 정의
interface ImageModalProps {
  photos: Photo[]; // 전체 사진 객체들의 배열 (필수)
  onClose: () => void; // 모달을 닫을 때 호출할 함수 (필수)
  initialIndex?: number; // 모달이 처음 열릴 때 보여줄 사진의 초기 인덱스 (선택 사항, 기본값 0)
}

// ImageModal 컴포넌트 정의
export default function ImageModal({
  photos,
  onClose,
  initialIndex = 0,
}: ImageModalProps) {
  // 현재 모달에서 보고 있는 사진의 인덱스를 관리하는 상태
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 사진 데이터가 유효한지 확인. 유효하지 않으면 아무것도 렌더링하지 않음.
  // HallDetailPage에서 이미 체크하지만, 모달 컴포넌트 자체의 안정성을 위해 좋습니다.
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    console.error("ImageModal received invalid or empty photos data.");
    // 유효하지 않은 데이터를 받으면 모달을 열지 않거나 즉시 닫도록 처리할 수 있습니다.
    // onClose(); // useEffect 안에서 호출해야 무한 루프를 방지합니다.
    return null; // 아무것도 렌더링하지 않음
  }

  // 키보드 이벤트 핸들러: ESC 키로 모달 닫기, 좌우 화살표 키로 사진 이동
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(); // ESC 키 누르면 모달 닫기
      } else if (event.key === "ArrowLeft") {
        handlePrev(); // 왼쪽 화살표 키 누르면 이전 사진
      } else if (event.key === "ArrowRight") {
        handleNext(); // 오른쪽 화살표 키 누르면 다음 사진
      }
    },
    [onClose, currentIndex, photos.length]
  ); // 의존성 배열에 상태와 props 추가

  // 모달이 마운트될 때 키보드 이벤트 리스너 등록 및 언마운트 시 해제
  useEffect(() => {
    // body에 overflow: hidden 스타일을 적용하여 스크롤 방지
    document.body.style.overflow = "hidden";

    // 키보드 이벤트 리스너 등록
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트가 언마운트될 때 (모달이 닫힐 때) 뒷처리
    return () => {
      // body 스크롤 허용 상태로 되돌림
      document.body.style.overflow = "unset";
      // 키보드 이벤트 리스너 제거
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]); // handleKeyDown 함수가 변경될 때마다 effect 재실행

  // currentIndex가 photos 배열 범위를 벗어나지 않도록 보정 (데이터 로딩 중 변경 등 예외 처리)
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= photos.length) {
      setCurrentIndex(0); // 범위를 벗어나면 첫 번째 사진으로 이동
    }
  }, [currentIndex, photos.length]);

  // 이전 사진으로 이동하는 함수
  const handlePrev = () => {
    // 현재 인덱스가 0이면 마지막 사진으로, 아니면 1 감소
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  // 다음 사진으로 이동하는 함수
  const handleNext = () => {
    // 현재 인덱스가 마지막이면 첫 번째 사진으로, 아니면 1 증가
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 현재 표시할 사진 정보 객체
  const currentPhoto = photos[currentIndex];

  // 모달 UI 렌더링
  return (
    // 모달 배경 오버레이: 화면 전체를 덮고 반투명한 검은색 배경
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" // z-index를 높게 설정하여 다른 요소 위에 표시
      // 배경의 반투명한 부분을 클릭하면 모달 닫기 (컨테이너 클릭 시 버블링 방지)
      onClick={onClose}
    >
      {/* 모달 내용 컨테이너: 이미지와 버튼들이 들어가는 영역 */}
      <div
        className="relative w-[1440px] h-full flex items-center justify-center p-8" // padding 추가
        onClick={(e) => e.stopPropagation()} // 내용 클릭 시 배경으로 이벤트 버블링 중단 -> 모달 안 닫힘
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-24 right-4 text-white text-6xl hover:text-gray-300 transition-colors z-20 cursor-pointer" // z-index를 이미지보다 높게 설정
          onClick={onClose}
          aria-label="Close modal" // 스크린 리더 사용자를 위한 레이블
        >
          <IoCloseCircleOutline />
        </button>

        {/* 이전 버튼 */}
        {photos.length > 1 && ( // 사진이 여러 장일 때만 이전 버튼 표시
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-5xl opacity-70 hover:opacity-100 transition-opacity z-20 bg-black bg-opacity-50 rounded-full p-2 cursor-pointer" // 배경 추가 및 투명도 조절
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }} // 클릭 이벤트 버블링 중단 및 이전 사진 이동
            aria-label="Previous photo"
          >
            <IoChevronBack />
          </button>
        )}

        {/* 다음 버튼 */}
        {photos.length > 1 && ( // 사진이 여러 장일 때만 다음 버튼 표시
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-5xl opacity-70 hover:opacity-100 transition-opacity z-20 bg-black bg-opacity-50 rounded-full p-2 cursor-pointer" // 배경 추가 및 투명도 조절
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }} // 클릭 이벤트 버블링 중단 및 다음 사진 이동
            aria-label="Next photo"
          >
            <IoChevronForward />
          </button>
        )}

        {/* 현재 표시할 사진 이미지 */}
        {currentPhoto?.url ? (
          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh]">
            {" "}
            {/* 최대 너비/높이를 화면의 95%로 제한 */}
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.caption || `사진 ${currentIndex + 1}`} // alt 텍스트 설정
              layout="fill" // 부모 div에 맞춰 채우기
              objectFit="contain" // 이미지 비율을 유지하며 부모 컨테이너에 맞춤 (잘리지 않도록)
              className="rounded-md" // 이미지 모서리 둥글게
              priority // 모달이 열릴 때 로딩되므로 priority 높게 설정
            />
          </div>
        ) : (
          // 이미지 URL이 없을 경우 표시할 내용 (선택 사항)
          <div className="text-white text-center">
            이미지를 불러올 수 없습니다.
          </div>
        )}

        {/* 현재 사진 인덱스/전체 사진 개수 표시 */}
        {photos.length > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg bg-black bg-opacity-50 px-3 py-1 rounded-full z-20">
            {" "}
            {/* 배경 추가 및 투명도 조절 */}
            {currentIndex + 1} / {photos.length} {/* 1부터 시작하도록 +1 */}
          </div>
        )}
      </div>
    </div>
  );
}
