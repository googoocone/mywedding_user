"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { StaticImageData } from "next/image"; // StaticImageData는 로컬 이미지 사용 시 필요할 수 있음
import { IoCloseCircleOutline } from "react-icons/io5";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface Photo {
  id?: number | string; // key로 사용될 수 있으므로 string도 허용
  url: string | StaticImageData; // 로컬 이미지도 고려
  caption?: string;
  width?: number; // 이미지 원본 너비 (이전 대화에서 논의)
  height?: number; // 이미지 원본 높이 (이전 대화에서 논의)
  blurDataURL?: string; // placeholder="blur" 사용 시
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
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // --- 기존 코드 시작 ---
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    useEffect(() => {
      // 컴포넌트 렌더링 후 onClose 호출
      onClose();
    }, [onClose]);
    return null;
  }

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
    [onClose, currentIndex, photos.length] // currentIndex, photos.length 의존성 유지
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (
      photos.length > 0 &&
      (currentIndex < 0 || currentIndex >= photos.length)
    ) {
      setCurrentIndex(0);
    }
  }, [currentIndex, photos.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };
  // --- 기존 코드 끝 ---

  // ✨ 인접 이미지 프리로딩 로직 추가 ✨
  useEffect(() => {
    if (photos && photos.length > 1) {
      // 다음 이미지 미리 로드
      const nextPhotoIndex = (currentIndex + 1) % photos.length;
      const nextPhoto = photos[nextPhotoIndex];
      if (nextPhoto && typeof nextPhoto.url === "string") {
        // URL이 문자열일 때만
        const nextImg = new window.Image();
        nextImg.src = nextPhoto.url;
      }

      // 이전 이미지 미리 로드 (만약 사진이 2장 이상이고, next와 prev가 다른 경우)
      if (photos.length > 2) {
        // 3장 이상일 때 이전/다음이 확실히 다름. 2장이면 이전/다음이 같을 수 있음.
        const prevPhotoIndex =
          (currentIndex - 1 + photos.length) % photos.length;
        // 다음 이미지와 이전 이미지가 같은 경우 (사진이 총 2장일 때) 중복 로드 방지
        if (prevPhotoIndex !== nextPhotoIndex) {
          const prevPhoto = photos[prevPhotoIndex];
          if (prevPhoto && typeof prevPhoto.url === "string") {
            const prevImg = new window.Image();
            prevImg.src = prevPhoto.url;
          }
        }
      }
    }
  }, [currentIndex, photos]); // currentIndex가 바뀌거나 photos 배열 자체가 바뀔 때 실행

  const currentPhoto = photos[currentIndex];
  // 모달 첫 로드 시 현재 이미지가 초기 인덱스인지 여부 (priority 적용 위함)
  const isInitialPhoto = currentIndex === initialIndex;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1440px] h-full flex items-center justify-center p-4 sm:p-8" // 반응형 패딩
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white text-4xl sm:text-6xl hover:text-gray-300 transition-colors z-20 cursor-pointer"
          onClick={onClose}
          aria-label="Close modal"
        >
          <IoCloseCircleOutline />
        </button>

        {photos.length > 1 && (
          <>
            <button
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl sm:text-5xl opacity-70 hover:opacity-100 transition-opacity z-20 bg-black bg-opacity-50 rounded-full p-1 sm:p-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous photo"
            >
              <IoChevronBack />
            </button>
            <button
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl sm:text-5xl opacity-70 hover:opacity-100 transition-opacity z-20 bg-black bg-opacity-50 rounded-full p-1 sm:p-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next photo"
            >
              <IoChevronForward />
            </button>
          </>
        )}

        {currentPhoto?.url ? (
          <div className="flex items-center justify-center">
            <img
              src={currentPhoto.url}
              style={{
                display: "block",
                maxWidth: "80vw",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            ></img>
            {/* <Image
              key={
                currentPhoto.id ||
                (typeof currentPhoto.url === "string"
                  ? currentPhoto.url
                  : currentIndex)
              } // key 추가
              src={currentPhoto.url}
              alt={currentPhoto.caption || `사진 ${currentIndex + 1}`}
              width={currentPhoto.width || 1920} // 데이터에 없으면 기본값
              height={currentPhoto.height || 1080} // 데이터에 없으면 기본값
              quality={80} // 품질 (75-85 사이에서 조절)
              priority={isInitialPhoto} // 첫 이미지에만 priority 적용
              sizes="90vw" // 예시, 실제 뷰포트 차지 비율에 맞게
              placeholder={currentPhoto.blurDataURL ? "blur" : "empty"}
              blurDataURL={currentPhoto.blurDataURL}
              className="rounded-md"
              style={{
                display: "block",
                maxWidth: "95vw",
                maxHeight: "95vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            /> */}
          </div>
        ) : (
          <div className="text-white text-center">
            이미지를 불러올 수 없습니다.
          </div>
        )}

        {photos.length > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-base sm:text-lg bg-black bg-opacity-50 px-3 py-1 rounded-full z-20">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
    </div>
  );
}
