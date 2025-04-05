"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const weddingHalls = [
  "강남 더 라움",
  "빌라드 앳 지디",
  "채플 앳 논현",
  "아모르 하우스",
  "소노 펠리체",
];

export default function DynamicTitle() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false); // 사라지게 만들고
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % weddingHalls.length);
        setShow(true); // 다시 등장시킴
      }, 300); // 사라지는 시간 (ms)
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full text-[32px] sm:text-[40px] sm:text-center font-bold sm:h-[52px] overflow-hidden">
      <AnimatePresence mode="wait">
        {show && (
          <motion.span
            key={weddingHalls[currentIndex]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="inline-block text-[#ff767b]"
          >
            {weddingHalls[currentIndex]}
          </motion.span>
        )}
      </AnimatePresence>{" "}
      웨딩홀
      <span className="hidden sm:inline"> 견적이 궁금하신가요?</span>
      <span className="block sm:hidden ">견적이 궁금하신가요?</span>
    </div>
  );
}
