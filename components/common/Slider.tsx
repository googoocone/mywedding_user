"use client"; // 반드시 추가

import { Swiper, SwiperSlide } from "swiper/react"; // 올바른 Swiper 모듈 가져오기
import { Autoplay } from "swiper/modules";
import "swiper/css"; // Swiper의 CSS 파일 추가

import Image from "next/image";

export default function MySwiper() {
  return (
    <Swiper
      spaceBetween={40}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      modules={[Autoplay]}
      loop={true}
      slidesPerView={4}
      breakpoints={{
        0: {
          slidesPerView: 2, // 모바일에서 반만 보이게 (1.5개 보여줌)
          centeredSlides: true, // 중앙 정렬
        },
        768: {
          slidesPerView: 4, // 태블릿 이상
        },
      }}
      className="h-[100px] "
    >
      <SwiperSlide
        key={1}
        className="w-[170px] sm:w-[240px] h-[80px]  flex items-center justify-center shrink-0"
      >
        <div className="w-[170px] sm:w-[240px] h-[80px]  overflow-hidden  relative">
          <Image
            src={"/images/pages/home/levirmore.png"}
            fill
            alt="르비르모어강남"
            style={{ objectFit: "contain" }}
          ></Image>
        </div>
      </SwiperSlide>
      <SwiperSlide
        key={2}
        className="w-[170px] sm:w-[240px] h-[80px]  flex items-center justify-center shrink-0"
      >
        <div className="w-[170px] sm:w-[240px] h-[80px]  overflow-hidden  relative">
          <Image
            src={"/images/pages/home/laonjena.png"}
            fill
            alt="라온제나강남"
            style={{ objectFit: "contain" }}
          ></Image>
        </div>
      </SwiperSlide>
      <SwiperSlide
        key={3}
        className="w-[170px] sm:w-[240px] h-[80px]  flex items-center justify-center shrink-0"
      >
        <div className="w-[170px] sm:w-[240px] h-[80px]  overflow-hidden  relative">
          <Image
            src={"/images/pages/home/noblevalenti.png"}
            fill
            alt="노블발렌티"
            style={{ objectFit: "contain" }}
          ></Image>
        </div>
      </SwiperSlide>
      <SwiperSlide
        key={4}
        className="w-[170px] sm:w-[240px] h-[80px]  flex items-center justify-center shrink-0"
      >
        <div className="w-[170px] sm:w-[240px] h-[80px]  overflow-hidden  relative">
          <Image
            src={"/images/pages/home/sonofelice.png"}
            fill
            alt="소노펠리체"
            style={{ objectFit: "contain" }}
          ></Image>
        </div>
      </SwiperSlide>
      <SwiperSlide
        key={5}
        className="w-[170px] sm:w-[240px] h-[80px]  flex items-center justify-center shrink-0"
      >
        <div className="w-[170px] sm:w-[240px] h-[80px]  overflow-hidden  relative">
          <Image
            src={"/images/pages/home/villadeamor.png"}
            fill
            alt="빌라드아모르"
            style={{ objectFit: "contain" }}
          ></Image>
        </div>
      </SwiperSlide>
      <SwiperSlide
        key={6}
        className="w-[170px] sm:w-[240px] h-[80px]  flex items-center justify-center shrink-0"
      >
        <div className="w-[170px] sm:w-[240px] h-[80px]  overflow-hidden  relative">
          <Image
            src={"/images/pages/home/amorhouse.gif"}
            fill
            alt="아모르하우스"
            style={{ objectFit: "contain" }}
          ></Image>
        </div>
      </SwiperSlide>
      <SwiperSlide
        key={7}
        className="w-[170px] sm:w-[240px] h-[80px]  flex items-center justify-center shrink-0"
      >
        <div className="w-[170px] sm:w-[240px] h-[80px]  overflow-hidden  relative">
          <Image
            src={"/images/pages/home/marysapril.png"}
            fill
            alt="메리스에이프럴"
            style={{ objectFit: "contain" }}
          ></Image>
        </div>
      </SwiperSlide>
    </Swiper>
  );
}
