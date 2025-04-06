"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function HallSwiper() {
  const slideStyle = {
    width: "100%",
    height: "300px",
    background: "#eee",
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
          <div
            style={slideStyle}
            className="relative bg-gray-200 flex items-center justify-center"
          >
            Slide 1
          </div>
        </SwiperSlide>
        <SwiperSlide style={{ width: "820px", height: "300px" }}>
          <div
            style={slideStyle}
            className="relative bg-gray-200 flex items-center justify-center"
          >
            Slide 2
          </div>
        </SwiperSlide>
        <SwiperSlide style={{ width: "820px", height: "300px" }}>
          <div
            style={slideStyle}
            className="relative bg-gray-200 flex items-center justify-center"
          >
            Slide 3
          </div>
        </SwiperSlide>
        <SwiperSlide style={{ width: "820px", height: "300px" }}>
          <div
            style={slideStyle}
            className="relative bg-gray-200 flex items-center justify-center"
          >
            Slide 4
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
