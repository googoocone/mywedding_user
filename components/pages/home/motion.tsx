"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeInFromLeft = {
  hidden: { opacity: 0, x: -100 }, // 왼쪽에서 시작
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }, // 오른쪽으로 이동하며 나타남
};

const fadeInFromRight = {
  hidden: { opacity: 0, x: 100 }, // 왼쪽에서 시작
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }, // 오른쪽으로 이동하며 나타남
};

const fadeInFromBottom = {
  hidden: { opacity: 0, y: 100 }, // 왼쪽에서 시작
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }, // 오른쪽으로 이동하며 나타남
};

export default function Motion() {
  return (
    <>
      <div className="hidden w-full sm:flex flex-col items-center justify-center gap-20 mt-20">
        <div className="w-full h-[520px] flex items-center justify-center gap-20">
          <motion.div
            className="w-[465px] h-[350px] relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromLeft}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_desc_1.png" fill alt=""></Image>
          </motion.div>
          <motion.div
            className="w-[512px] h-[512px] relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromRight}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_img_1.png" fill alt=""></Image>
          </motion.div>
        </div>
        <div className="w-full h-[520px] flex items-center justify-center gap-20">
          <motion.div
            className="w-[512px] h-[512px] relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromLeft}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_img_2.png" fill alt=""></Image>
          </motion.div>
          <motion.div
            className="w-[465px] h-[398px] relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromRight}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_desc_2.png" fill alt=""></Image>
          </motion.div>
        </div>
        <div className="w-full h-[520px] flex items-center justify-center gap-20">
          <motion.div
            className="w-[478px] h-[349px] relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromLeft}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_desc_3.png" fill alt=""></Image>
          </motion.div>
          <motion.div
            className="w-[512px] h-[512px] relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromRight}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_img_3.png" fill alt=""></Image>
          </motion.div>
        </div>
      </div>
      <div className="sm:hidden w-full flex-col items-center justify-center gap-20 mt-20 px-3">
        <div className="w-full flex items-center justify-center ">
          <motion.div
            className="w-full h-[640px]  relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromBottom}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_1_mb.svg" fill alt=""></Image>
          </motion.div>
        </div>
        <div className="w-full flex items-center justify-center ">
          <motion.div
            className="w-full h-[690px]  relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromBottom}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_2_mb.svg" fill alt=""></Image>
          </motion.div>
        </div>
        <div className="w-full flex items-center justify-center ">
          <motion.div
            className="w-full h-[690px]  relative"
            initial="hidden"
            whileInView="visible"
            variants={fadeInFromBottom}
            viewport={{ once: true, amount: 0.5 }}
          >
            <Image src="/images/pages/home/toon_3_mb.svg" fill alt=""></Image>
          </motion.div>
        </div>
      </div>
    </>
  );
}
