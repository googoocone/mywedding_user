"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";

export default function HallSwiper() {
  const slideStyle = {
    width: "100%",
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
  };
  return (
    <div className="w-full mx-auto">
      <Swiper
        spaceBetween={30}
        slidesPerView="auto"
        centeredSlides={true}
        loop={true}
        style={{ width: "100%" }}
        className="w-full"
      >
        <SwiperSlide style={{ width: "820px", height: "300px" }}>
          <div className="w-full h-[300px] relative flex items-center justify-center">
            <Image
              src="/images/pages/home/slide1_desc.png"
              alt="슬라이드1"
              fill
            ></Image>
          </div>
        </SwiperSlide>
        <SwiperSlide style={{ width: "820px", height: "300px" }}>
          <div
            style={slideStyle}
            className="relative flex items-center justify-center"
          >
            <Image
              src="/images/pages/home/slide2_desc.png"
              alt="슬라이드1"
              fill
            ></Image>
          </div>
        </SwiperSlide>
        <SwiperSlide style={{ width: "820px", height: "300px" }}>
          <div
            style={slideStyle}
            className="relative flex items-center justify-center"
          >
            <Image
              src="/images/pages/home/slide3_desc.png"
              alt="슬라이드1"
              fill
            ></Image>
          </div>
        </SwiperSlide>
        <SwiperSlide style={{ width: "820px", height: "300px" }}>
          <div
            style={slideStyle}
            className="relative flex items-center justify-center"
          >
            <Image
              src="/images/pages/home/slide4_desc.png"
              alt="슬라이드1"
              fill
            ></Image>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
