"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { StaticImageData } from "next/image";
import {
  IoCloseCircleOutline,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

interface Photo {
  id?: number | string;
  url: string | StaticImageData;
  caption?: string;
  // width, height 정보가 없으므로 주석 처리 또는 제거
  // width?: number;
  // height?: number;
  blurDataURL?: string; // 있다면 계속 사용 가능
}

interface ImageModalProps {
  photos: Photo[];
  onClose: () => void;
  initialIndex?: number;
}

export default function ImageModal({
  photos,
  onClose,
  initialIndex = 0,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0); // 초기값은 아래 useEffect에서 설정
  const [isImageLoading, setIsImageLoading] = useState(true);

  // photos 배열 또는 initialIndex prop 변경 시 currentIndex 및 로딩 상태 초기화
  useEffect(() => {
    if (!photos || photos.length === 0) {
      onClose(); // 사진 데이터가 없으면 모달 즉시 닫기
      return;
    }
    // initialIndex를 photos 배열 범위 내로 보정
    const validInitialIndex = Math.max(
      0,
      Math.min(initialIndex, photos.length - 1)
    );
    setCurrentIndex(validInitialIndex);
    setIsImageLoading(true); // 새 이미지 세트/인덱스로 변경 시 로딩 상태 활성화
  }, [photos, initialIndex, onClose]);

  // currentIndex가 photos 배열의 유효 범위를 벗어날 경우 (예: photos 배열이 동적으로 줄어들었을 때)
  useEffect(() => {
    if (photos && photos.length > 0) {
      if (currentIndex >= photos.length) {
        setCurrentIndex(photos.length - 1);
        setIsImageLoading(true);
      } else if (currentIndex < 0) {
        // 거의 발생하지 않겠지만 방어 코드
        setCurrentIndex(0);
        setIsImageLoading(true);
      }
    }
  }, [currentIndex, photos]);

  const handlePrev = useCallback(() => {
    if (!photos || photos.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
    setIsImageLoading(true);
  }, [photos]); // photos.length 대신 photos 자체를 의존성으로 (배열 내용 변경 감지)

  const handleNext = useCallback(() => {
    if (!photos || photos.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
    setIsImageLoading(true);
  }, [photos]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    },
    [onClose, handlePrev, handleNext]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // 인접 이미지 프리로딩 (선택적)
  useEffect(() => {
    if (photos && photos.length > 1 && typeof window !== "undefined") {
      const preloadImage = (index: number) => {
        const photo = photos[index];
        if (photo && typeof photo.url === "string") {
          // StaticImageData가 아닌 외부 URL만
          const img = new window.Image();
          img.src = photo.url;
        }
      };
      const nextPhotoIndex = (currentIndex + 1) % photos.length;
      preloadImage(nextPhotoIndex);

      if (photos.length > 1) {
        // 항상 이전 이미지가 존재 (순환)
        const prevPhotoIndex =
          (currentIndex - 1 + photos.length) % photos.length;
        if (prevPhotoIndex !== nextPhotoIndex) {
          // 사진이 2장일 때 중복 로드 방지
          preloadImage(prevPhotoIndex);
        }
      }
    }
  }, [currentIndex, photos]);

  // photos가 없거나, 비어있거나, 현재 인덱스의 사진이 없으면 렌더링하지 않음
  if (!photos || photos.length === 0 || !photos[currentIndex]) {
    // useEffect에서 onClose가 이미 호출되었을 수 있으나, 안전을 위해 한 번 더 체크
    // 또는 로딩 상태를 보여줄 수도 있습니다.
    return null;
  }

  const currentPhoto = photos[currentIndex];
  // initialIndex가 prop으로 변경될 수 있으므로, 보정된 값과 비교하여 priority 결정
  const correctedInitialIndex = Math.max(
    0,
    Math.min(initialIndex, photos.length - 1)
  );
  const isPriorityImage = currentIndex === correctedInitialIndex;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[2000]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-caption"
    >
      <div
        className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white text-3xl sm:text-4xl hover:text-gray-300 transition-colors z-20 cursor-pointer"
          onClick={onClose}
          aria-label="이미지 모달 닫기"
        >
          <IoCloseCircleOutline />
        </button>

        {/* 이미지 표시 영역: 부모 div에 position:relative와 크기 지정 */}
        <div className="relative flex items-center justify-center w-[90vw] h-[calc(100vh-120px)] sm:w-[95vw] sm:h-[calc(100vh-100px)]">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          {/* next/image에 fill prop 사용, width/height prop 제거 */}
          <Image
            key={
              currentPhoto.id ||
              (typeof currentPhoto.url === "string"
                ? currentPhoto.url
                : currentIndex)
            }
            src={currentPhoto.url}
            alt={currentPhoto.caption || `사진 ${currentIndex + 1}`}
            fill // 부모 요소에 맞춰 채움
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 70vw" // 최적화된 이미지 선택을 위한 힌트
            quality={80} // 이미지 품질
            priority={isPriorityImage} // 첫 이미지 우선 로드
            placeholder={currentPhoto.blurDataURL ? "blur" : "empty"}
            blurDataURL={currentPhoto.blurDataURL}
            className={`object-contain transition-opacity duration-300 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`} // 로딩 시 부드럽게 표시, object-contain으로 비율 유지
            onLoad={() => setIsImageLoading(false)}
            onError={(e) => {
              console.error("이미지 로드 실패:", currentPhoto.url, e);
              setIsImageLoading(false);
            }}
          />
        </div>

        {photos.length > 1 && (
          <>
            <button
              className="absolute left-1 sm:left-3 top-1/2 transform -translate-y-1/2 text-white text-2xl sm:text-4xl opacity-60 hover:opacity-100 transition-opacity z-20 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-1.5 sm:p-2 cursor-pointer select-none"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="이전 사진"
            >
              <IoChevronBack />
            </button>
            <button
              className="absolute right-1 sm:right-3 top-1/2 transform -translate-y-1/2 text-white text-2xl sm:text-4xl opacity-60 hover:opacity-100 transition-opacity z-20 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-1.5 sm:p-2 cursor-pointer select-none"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="다음 사진"
            >
              <IoChevronForward />
            </button>
          </>
        )}

        <div
          id="image-modal-caption"
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-white text-xs sm:text-sm text-center bg-black bg-opacity-50 px-3 py-1.5 rounded-full z-20 min-w-[50px]"
        >
          {currentPhoto.caption && (
            <span className="mr-2">{currentPhoto.caption}</span>
          )}
          {photos.length > 0 && (
            <span>
              {currentIndex + 1} / {photos.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
